import { Router } from 'express';
import { getVideos, getVideoById} from '../controllers/videoController';

const router = Router();

/*
 * @route GET /api/videos
 * @desc Get videos with pagination
 * @access Public
 */

router.get('/', getVideos);

/*
 * @route GET /api/videos/:id
 * @desc Get a single video by ID
 * @access Public
 */

router.get('/:id', getVideoById);

export default router;
