const express = require('express');
const router = express.Router();
const { supabase } = require('../../config/database');

/**
 * GET /api/v1/genres
 * Get all unique genres across movies and TV series
 */
router.get('/', async (req, res) => {
  try {
    const [moviesResult, seriesResult] = await Promise.all([
      supabase.from('movies').select('genres'),
      supabase.from('tv_series').select('genres'),
    ]);

    const allGenres = new Set();

    (moviesResult.data || []).forEach(m => {
      (m.genres || []).forEach(g => allGenres.add(g));
    });
    (seriesResult.data || []).forEach(s => {
      (s.genres || []).forEach(g => allGenres.add(g));
    });

    const genres = Array.from(allGenres).sort();

    return res.json({
      success: true,
      data: genres,
      count: genres.length,
    });
  } catch (err) {
    console.error('Genres error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch genres.' });
  }
});

/**
 * GET /api/v1/stats
 * Public platform statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [moviesCount, seriesCount, usersCount] = await Promise.all([
      supabase.from('movies').select('*', { count: 'exact', head: true }),
      supabase.from('tv_series').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
    ]);

    // Top rated movies
    const { data: topMovies } = await supabase
      .from('movies')
      .select('id, title, rating_imdb, genres, year')
      .order('rating_imdb', { ascending: false })
      .limit(5);

    // Top rated series
    const { data: topSeries } = await supabase
      .from('tv_series')
      .select('id, title, rating_imdb, genres, year_start')
      .order('rating_imdb', { ascending: false })
      .limit(5);

    return res.json({
      success: true,
      data: {
        total_movies: moviesCount.count,
        total_series: seriesCount.count,
        total_users: usersCount.count,
        top_rated_movies: topMovies,
        top_rated_series: topSeries,
        last_updated: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch statistics.' });
  }
});

module.exports = router;
