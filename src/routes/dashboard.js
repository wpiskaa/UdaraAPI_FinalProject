const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabase } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// All dashboard routes require JWT
router.use(requireAuth);

// =============================================
// API KEY MANAGEMENT
// =============================================

/**
 * GET /dashboard/keys
 * List all API keys for the authenticated user
 */
router.get('/keys', async (req, res) => {
  try {
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('id, key_name, api_key, is_active, rate_limit_per_day, requests_today, total_requests, last_used_at, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      data: keys,
      count: keys.length,
    });
  } catch (err) {
    console.error('Get keys error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch API keys.' });
  }
});

/**
 * POST /dashboard/keys
 * Create a new API key
 */
router.post('/keys', async (req, res) => {
  try {
    const { key_name } = req.body;

    if (!key_name || key_name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Key name must be at least 2 characters.',
      });
    }

    // Get user plan to set rate limit
    const { data: user } = await supabase
      .from('users')
      .select('plan')
      .eq('id', req.user.id)
      .single();

    const rateLimits = { free: 100, pro: 10000, enterprise: 100000 };
    const rateLimit = rateLimits[user?.plan] || 100;

    // Check key count limit per plan
    const maxKeys = { free: 2, pro: 10, enterprise: 50 };
    const { count } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (count >= (maxKeys[user?.plan] || 2)) {
      return res.status(403).json({
        success: false,
        error: `Your ${user?.plan} plan allows up to ${maxKeys[user?.plan]} API keys. Upgrade to create more.`,
      });
    }

    // Generate a secure API key: ck_live_xxxxx (56 chars total)
    const rawKey = crypto.randomBytes(24).toString('hex');
    const apiKey = `ck_live_${rawKey}`;

    const { data: newKey, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: req.user.id,
        key_name: key_name.trim(),
        api_key: apiKey,
        rate_limit_per_day: rateLimit,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'API key created successfully! Save this key — it will not be shown again in full.',
      data: newKey,
    });
  } catch (err) {
    console.error('Create key error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create API key.' });
  }
});

/**
 * PATCH /dashboard/keys/:id
 * Toggle API key active/inactive
 */
router.patch('/keys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, key_name } = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from('api_keys')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, error: 'API key not found.' });
    }

    const updates = {};
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (key_name) updates.key_name = key_name.trim();

    const { data: updated, error } = await supabase
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: `API key ${updates.is_active !== undefined ? (updates.is_active ? 'activated' : 'deactivated') : 'updated'} successfully.`,
      data: updated,
    });
  } catch (err) {
    console.error('Update key error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update API key.' });
  }
});

/**
 * DELETE /dashboard/keys/:id
 * Delete an API key
 */
router.delete('/keys/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabase
      .from('api_keys')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      return res.status(404).json({ success: false, error: 'API key not found.' });
    }

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.json({
      success: true,
      message: 'API key deleted successfully.',
    });
  } catch (err) {
    console.error('Delete key error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete API key.' });
  }
});

// =============================================
// USAGE ANALYTICS
// =============================================

/**
 * GET /dashboard/usage
 * Get usage statistics for all user's API keys
 */
router.get('/usage', async (req, res) => {
  try {
    // Get all key IDs for this user
    const { data: keys } = await supabase
      .from('api_keys')
      .select('id, key_name, total_requests, requests_today')
      .eq('user_id', req.user.id);

    const keyIds = keys.map(k => k.id);

    if (keyIds.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: { total_requests: 0, requests_today: 0, active_keys: 0 },
          keys: [],
          daily_usage: [],
        },
      });
    }

    // Get last 7 days of usage logs
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: logs } = await supabase
      .from('api_usage_logs')
      .select('created_at, endpoint, status_code')
      .in('api_key_id', keyIds)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Group logs by day
    const dailyUsage = {};
    (logs || []).forEach(log => {
      const day = log.created_at.split('T')[0];
      dailyUsage[day] = (dailyUsage[day] || 0) + 1;
    });

    // Build last 7 days array
    const dailyArray = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      dailyArray.push({ date: dayStr, requests: dailyUsage[dayStr] || 0 });
    }

    const totalRequests = keys.reduce((sum, k) => sum + (k.total_requests || 0), 0);
    const requestsToday = keys.reduce((sum, k) => sum + (k.requests_today || 0), 0);

    // Top endpoints
    const endpointCounts = {};
    (logs || []).forEach(log => {
      endpointCounts[log.endpoint] = (endpointCounts[log.endpoint] || 0) + 1;
    });
    const topEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([endpoint, count]) => ({ endpoint, count }));

    return res.json({
      success: true,
      data: {
        summary: {
          total_requests: totalRequests,
          requests_today: requestsToday,
          active_keys: keys.length,
        },
        keys,
        daily_usage: dailyArray,
        top_endpoints: topEndpoints,
      },
    });
  } catch (err) {
    console.error('Usage error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch usage data.' });
  }
});

/**
 * GET /dashboard/profile
 * Get user profile
 */
router.get('/profile', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, plan, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) return res.status(404).json({ success: false, error: 'User not found.' });

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

module.exports = router;
