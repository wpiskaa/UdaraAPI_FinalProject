const express = require('express');
const router = express.Router();
const { supabase } = require('../../config/database');

/**
 * GET /api/v1/stations
 * Daftar semua stasiun dengan filter province, operator, kota
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, province, city, operator, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('stations')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (province) query = query.ilike('province', `%${province}%`);
    if (city) query = query.ilike('city', `%${city}%`);
    if (operator) query = query.ilike('operator', `%${operator}%`);
    if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,province.ilike.%${search}%`);

    query = query.order('province').order('city').range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return res.json({
      success: true, data,
      pagination: {
        page: pageNum, limit: limitNum, total: count,
        total_pages: Math.ceil(count / limitNum),
        has_next: pageNum * limitNum < count, has_prev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Gagal mengambil data stasiun.' });
  }
});

/**
 * GET /api/v1/stations/provinces
 * Daftar provinsi yang memiliki stasiun
 */
router.get('/provinces', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stations')
      .select('province')
      .eq('is_active', true)
      .order('province');
    if (error) throw error;

    const provinces = [...new Set(data.map(s => s.province))].map(p => ({
      province: p,
      count: data.filter(s => s.province === p).length,
    }));

    return res.json({ success: true, data: provinces, count: provinces.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Gagal mengambil daftar provinsi.' });
  }
});

/**
 * GET /api/v1/stations/:id
 * Detail stasiun berdasarkan ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID harus berupa angka.' });

    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !data) return res.status(404).json({ success: false, error: `Stasiun ID ${id} tidak ditemukan.` });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * GET /api/v1/stations/:id/records
 * Riwayat kualitas udara dari satu stasiun
 */
router.get('/:id/records', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 30, tanggal_mulai, tanggal_akhir } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID harus berupa angka.' });

    // Check station exists
    const { data: station } = await supabase.from('stations').select('*').eq('id', parseInt(id)).single();
    if (!station) return res.status(404).json({ success: false, error: `Stasiun ID ${id} tidak ditemukan.` });

    let query = supabase
      .from('air_quality_records')
      .select('*', { count: 'exact' })
      .eq('station_id', parseInt(id));

    if (tanggal_mulai) query = query.gte('tanggal', tanggal_mulai);
    if (tanggal_akhir) query = query.lte('tanggal', tanggal_akhir);
    query = query.order('tanggal', { ascending: false }).range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return res.json({
      success: true, station, data,
      pagination: { page: pageNum, limit: limitNum, total: count, total_pages: Math.ceil(count / limitNum) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * GET /api/v1/stats (public, no API key needed — mounted separately in app.js)
 */
router.get('/public/stats', async (req, res) => {
  try {
    const [{ count: totalStations }, { count: totalRecords }, { data: categories }] = await Promise.all([
      supabase.from('stations').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('air_quality_records').select('*', { count: 'exact', head: true }),
      supabase.from('air_quality_records').select('kategori'),
    ]);

    const catCount = {};
    categories?.forEach(r => { catCount[r.kategori] = (catCount[r.kategori] || 0) + 1; });

    return res.json({
      success: true,
      data: {
        total_stations: totalStations,
        total_records: totalRecords,
        coverage: '38 Provinsi Indonesia',
        pollutants: ['PM2.5', 'PM10', 'SO2', 'CO', 'NO2', 'O3'],
        categories: catCount,
        api_version: 'v1',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

module.exports = router;
