import { Router } from 'express';
import { login, me, signup, updatePreferences, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', (req, res) => res.json({ ok: true }));
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);

export default router;
