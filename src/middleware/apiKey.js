const { supabase } = require('../config/database');

/**
 * Middleware: Validate API Key from X-API-Key header or ?api_key= query param
 * Enforces rate limiting per day based on user plan
 */
const requireApiKey = async (req, res, next) => {
  let apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (!apiKey && req.headers.authorization) {
    apiKey = req.headers.authorization.replace(/^Bearer\s+/i, '');
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key is required. Pass it via X-API-Key header, Authorization: Bearer header, or ?api_key= query parameter.',
      docs: 'https://udara-api-final-project.vercel.app',
    });
  }

  // Look up the API key in the database
  const { data: keyRecord, error } = await supabase
    .from('api_keys')
    .select('*, users(plan, is_active)')
    .eq('api_key', apiKey)
    .single();

  if (error || !keyRecord) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key.',
    });
  }

  if (!keyRecord.is_active) {
    return res.status(403).json({
      success: false,
      error: 'This API key has been deactivated.',
    });
  }

  if (!keyRecord.users?.is_active) {
    return res.status(403).json({
      success: false,
      error: 'Your account has been suspended.',
    });
  }

  // Auto-reset daily counter if it's a new day
  const lastReset = new Date(keyRecord.last_reset_at);
  const now = new Date();
  const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

  let requestsToday = keyRecord.requests_today;
  if (hoursSinceReset >= 24) {
    requestsToday = 0;
    // Reset in background
    supabase
      .from('api_keys')
      .update({ requests_today: 0, last_reset_at: now.toISOString() })
      .eq('id', keyRecord.id)
      .then(() => {});
  }

  // Check rate limit
  if (requestsToday >= keyRecord.rate_limit_per_day) {
    return res.status(429).json({
      success: false,
      error: 'Daily rate limit exceeded.',
      limit: keyRecord.rate_limit_per_day,
      reset_at: new Date(lastReset.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  // Attach key info to request
  req.apiKey = keyRecord;
  req.startTime = Date.now();

  // Update usage counters and log in background (after response)
  res.on('finish', async () => {
    const responseTime = Date.now() - req.startTime;

    // Update request counts
    await supabase
      .from('api_keys')
      .update({
        requests_today: requestsToday + 1,
        total_requests: (keyRecord.total_requests || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', keyRecord.id);

    // Log usage
    await supabase.from('api_usage_logs').insert({
      api_key_id: keyRecord.id,
      endpoint: req.path,
      method: req.method,
      status_code: res.statusCode,
      response_time_ms: responseTime,
      ip_address: req.ip || req.headers['x-forwarded-for'],
    });
  });

  next();
};

module.exports = { requireApiKey };
