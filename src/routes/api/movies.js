const express = require('express');
const router = express.Router();
const { supabase } = require('../../config/database');

/**
 * GET /api/v1/movies
 * List movies with pagination, filtering, and sorting
 * Query params: page, limit, genre, year, language, country, sort, order
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      genre,
      year,
      language,
      country,
      sort = 'rating_imdb',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('movies')
      .select('*', { count: 'exact' });

    // Filters
    if (genre) query = query.contains('genres', [genre]);
    if (year) query = query.eq('year', parseInt(year));
    if (language) query = query.ilike('language', language);
    if (country) query = query.ilike('country', `%${country}%`);

    // Sorting
    const validSorts = ['rating_imdb', 'rating_audience', 'year', 'title', 'runtime_minutes'];
    const sortField = validSorts.includes(sort) ? sort : 'rating_imdb';
    query = query.order(sortField, { ascending: order === 'asc', nullsFirst: false });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: movies, error, count } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      data: movies,
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
    console.error('Movies list error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch movies.' });
  }
});

/**
 * GET /api/v1/movies/search
 * Search movies by title or synopsis
 * Query params: q (required), page, limit
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

    const { data: movies, error, count } = await supabase
      .from('movies')
      .select('*', { count: 'exact' })
      .or(`title.ilike.%${q}%,synopsis.ilike.%${q}%,director.ilike.%${q}%`)
      .order('rating_imdb', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) throw error;

    return res.json({
      success: true,
      query: q,
      data: movies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        total_pages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    console.error('Movies search error:', err);
    return res.status(500).json({ success: false, error: 'Search failed.' });
  }
});

/**
 * GET /api/v1/movies/:id
 * Get a single movie by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Movie ID must be a number.' });
    }

    const { data: movie, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !movie) {
      return res.status(404).json({
        success: false,
        error: `Movie with ID ${id} not found.`,
      });
    }

    return res.json({ success: true, data: movie });
  } catch (err) {
    console.error('Movie detail error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch movie.' });
  }
});

module.exports = router;
