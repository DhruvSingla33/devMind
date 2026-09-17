import { Router } from 'express';
import { toggleBookmark, getMyBookmarks } from '../controllers/bookmark.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', toggleBookmark);
router.get('/my-bookmarks', getMyBookmarks);

export default router;
