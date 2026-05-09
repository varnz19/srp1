import { Router } from 'express';
import { trendingTv } from '../controllers/mediaController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/trending', protect, trendingTv);

export default router;
