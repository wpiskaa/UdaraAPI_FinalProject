require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

// =============================================
// MIDDLEWARE
// =============================================
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Global rate limiter (IP-based)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// =============================================
// SERVE STATIC FILES
// =============================================
app.use(express.static(path.join(__dirname, '../public')));

// =============================================
// SERVE HTML PAGES (Must be before API routes)
// =============================================
app.get(['/dashboard', '/dashboard/'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// =============================================
// AUTH ROUTES (JWT)
// =============================================
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// =============================================
// DASHBOARD API ROUTES (JWT protected)
// =============================================
const dashboardRoutes = require('./routes/dashboard');
app.use('/dashboard', dashboardRoutes);

// =============================================
// PUBLIC API ROUTES (API Key protected)
// =============================================
const { requireApiKey } = require('./middleware/apiKey');
const stationsRoutes = require('./routes/api/stations');
const recordsRoutes = require('./routes/api/records');

// Stats (public, no key needed)
app.get('/api/v1/stats', async (req, res) => {
  const { supabase } = require('./config/database');
  try {
    const [{ count: totalStations }, { count: totalRecords }, { data: catData }] = await Promise.all([
      supabase.from('stations').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('air_quality_records').select('*', { count: 'exact', head: true }),
      supabase.from('air_quality_records').select('kategori'),
    ]);
    const catCount = {};
    catData?.forEach(r => { catCount[r.kategori] = (catCount[r.kategori] || 0) + 1; });
    return res.json({
      success: true,
      data: {
        platform: 'UdaraAPI',
        version: '1.0',
        total_stations: totalStations,
        total_records: totalRecords,
        coverage: '38 Provinsi Indonesia',
        pollutants: ['PM2.5', 'PM10', 'SO2', 'CO', 'NO2', 'O3'],
        categories: catCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// Protected endpoints (require API key)
app.use('/api/v1/stations', requireApiKey, stationsRoutes);
app.use('/api/v1/records', requireApiKey, recordsRoutes);

// =============================================
// API INFO (public)
// =============================================
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'UdaraAPI',
    version: '1.0.0',
    description: 'Data Kualitas Udara (ISPU) Indonesia via REST API',
    docs: 'https://udara-api.vercel.app',
    endpoints: {
      stations: {
        list: 'GET /api/v1/stations',
        provinces: 'GET /api/v1/stations/provinces',
        detail: 'GET /api/v1/stations/:id',
        records: 'GET /api/v1/stations/:id/records',
      },
      records: {
        list: 'GET /api/v1/records',
        latest: 'GET /api/v1/records/latest',
        berbahaya: 'GET /api/v1/records/berbahaya',
        detail: 'GET /api/v1/records/:id',
      },
      stats: 'GET /api/v1/stats (public)',
    },
    authentication: 'Pass your API key via X-API-Key header or ?api_key= query param',
  });
});

// =============================================
// 404 & ERROR HANDLER
// =============================================
app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/dashboard/')) {
    return res.status(404).json({ success: false, error: `Endpoint ${req.method} ${req.path} not found.` });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, error: 'Internal server error.' });
});

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌫️ UdaraAPI running on http://localhost:${PORT}`);
});

module.exports = app;
