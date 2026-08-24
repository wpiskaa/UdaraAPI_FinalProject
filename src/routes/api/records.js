const express = require('express');
const router = express.Router();
const { supabase } = require('../../config/database');

/**
 * GET /api/v1/records
 * Data kualitas udara harian dengan filter lengkap
 * Query: page, limit, station_id, province, kategori, tanggal_mulai, tanggal_akhir, sort, order
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1, limit = 20, station_id, province,
      kategori, tanggal_mulai, tanggal_akhir,
      sort = 'tanggal', order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('air_quality_records')
      .select('*, stations(name, city, province, latitude, longitude)', { count: 'exact' });

    if (station_id) query = query.eq('station_id', parseInt(station_id));
    if (kategori) query = query.eq('kategori', kategori.toUpperCase());
    if (tanggal_mulai) query = query.gte('tanggal', tanggal_mulai);
    if (tanggal_akhir) query = query.lte('tanggal', tanggal_akhir);
    if (province) {
      // Filter by province via joined stations table
      const { data: stationIds } = await supabase
        .from('stations')
        .select('id')
        .ilike('province', `%${province}%`);
      if (stationIds?.length) {
        query = query.in('station_id', stationIds.map(s => s.id));
      }
    }

    const validSorts = ['tanggal', 'ispu', 'pm25', 'pm10', 'created_at'];
    const sortField = validSorts.includes(sort) ? sort : 'tanggal';
    query = query.order(sortField, { ascending: order === 'asc', nullsFirst: false });
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return res.json({
      success: true,
      data,
      pagination: {
        page: pageNum, limit: limitNum, total: count,
        total_pages: Math.ceil(count / limitNum),
        has_next: pageNum * limitNum < count,
        has_prev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Gagal mengambil data kualitas udara.' });
  }
});

/**
 * GET /api/v1/records/latest
 * Data terbaru 1 record per stasiun (snapshot kondisi udara saat ini)
 */
router.get('/latest', async (req, res) => {
  try {
    const { province } = req.query;

    // Get latest date per station
    let stationsQ = supabase.from('stations').select('id, name, city, province, latitude, longitude').eq('is_active', true);
    if (province) stationsQ = stationsQ.ilike('province', `%${province}%`);
    const { data: stations } = await stationsQ;

    const results = await Promise.all(
      (stations || []).map(async (station) => {
        const { data } = await supabase
          .from('air_quality_records')
          .select('*')
          .eq('station_id', station.id)
          .order('tanggal', { ascending: false })
          .limit(1)
          .single();
        if (!data) return null;
        return { ...data, station };
      })
    );

    const filtered = results.filter(Boolean);
    return res.json({ success: true, data: filtered, count: filtered.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Gagal mengambil data terbaru.' });
  }
});

/**
 * GET /api/v1/records/berbahaya
 * Daftar record dengan kategori SANGAT TIDAK SEHAT atau BERBAHAYA
 */
router.get('/berbahaya', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { data, error, count } = await supabase
      .from('air_quality_records')
      .select('*, stations(name, city, province)', { count: 'exact' })
      .in('kategori', ['SANGAT TIDAK SEHAT', 'BERBAHAYA'])
      .order('ispu', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;
    return res.json({
      success: true, data,
      pagination: { page: pageNum, limit: limitNum, total: count, total_pages: Math.ceil(count / limitNum) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Gagal mengambil data berbahaya.' });
  }
});

/**
 * GET /api/v1/records/:id
 * Detail satu record berdasarkan ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID harus berupa angka.' });

    const { data, error } = await supabase
      .from('air_quality_records')
      .select('*, stations(name, city, province, latitude, longitude, operator)')
      .eq('id', parseInt(id))
      .single();

    if (error || !data) return res.status(404).json({ success: false, error: `Data record ID ${id} tidak ditemukan.` });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

module.exports = router;
