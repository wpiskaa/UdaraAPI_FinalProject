const express = require('express');
const router = express.Router();
const { supabase } = require('../../config/database');

/**
 * GET /api/v1/series
 * List TV series with pagination and filtering
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      genre,
      status,
      network,
      language,
      sort = 'rating_imdb',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('tv_series')
      .select('*', { count: 'exact' });

    if (genre) query = query.contains('genres', [genre]);
    if (status) query = query.eq('status', status);
    if (network) query = query.ilike('network', `%${network}%`);
    if (language) query = query.ilike('language', language);

    const validSorts = ['rating_imdb', 'rating_audience', 'year_start', 'title', 'seasons', 'episodes'];
    const sortField = validSorts.includes(sort) ? sort : 'rating_imdb';
    query = query.order(sortField, { ascending: order === 'asc', nullsFirst: false });

    query = query.range(offset, offset + limitNum - 1);

    const { data: series, error, count } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      data: series,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        total_pages: Math.ceil(count / limitNum),
        has_next: pageNum * limitNum < count,
        has_prev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error('Series list error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch TV series.' });
  }
});

/**
 * GET /api/v1/series/search
 * Search TV series by title, synopsis, or creator
 */
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) must be at least 2 characters.',
      });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { data: series, error, count } = await supabase
      .from('tv_series')
      .select('*', { count: 'exact' })
      .or(`title.ilike.%${q}%,synopsis.ilike.%${q}%,creator.ilike.%${q}%`)
      .order('rating_imdb', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    return res.json({
      success: true,
      query: q,
      data: series,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        total_pages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    console.error('Series search error:', err);
    return res.status(500).json({ success: false, error: 'Search failed.' });
  }
});

/**
 * GET /api/v1/series/:id
 * Get a single TV series by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Series ID must be a number.' });
    }

    const { data: series, error } = await supabase
      .from('tv_series')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !series) {
      return res.status(404).json({
        success: false,
        error: `TV Series with ID ${id} not found.`,
      });
    }

    return res.json({ success: true, data: series });
  } catch (err) {
    console.error('Series detail error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch TV series.' });
  }
});

module.exports = router;
