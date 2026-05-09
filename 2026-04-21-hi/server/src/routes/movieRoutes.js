import { Router } from 'express';
import { movieDetails, popularMovies, trendingMovies } from '../controllers/mediaController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/trending', protect, trendingMovies);
router.get('/popular', protect, popularMovies);
router.get('/:id', protect, movieDetails);

export default router;
