import { Router } from 'express';
import { assistant, randomPick, recommendations, trackInteraction } from '../controllers/recommendationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, recommendations);
router.get('/random', protect, randomPick);
router.post('/track', protect, trackInteraction);
router.post('/assistant', protect, assistant);

export default router;
