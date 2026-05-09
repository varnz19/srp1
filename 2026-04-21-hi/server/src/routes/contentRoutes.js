import { Router } from 'express';
import {
  getContentDetails,
  getWatchlist,
  discoverContent,
  importExternalContent,
  listContent,
  searchContent,
  trending,
  updateWatchlist
} from '../controllers/contentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, listContent);
router.get('/search', protect, searchContent);
router.get('/trending', protect, trending);
router.get('/discover', protect, discoverContent);
router.post('/import', protect, importExternalContent);
router.get('/watchlist', protect, getWatchlist);
router.post('/watchlist', protect, updateWatchlist);
router.get('/:id', protect, getContentDetails);

export default router;
