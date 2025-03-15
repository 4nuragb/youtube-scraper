import { Router} from 'express';
import { searchVideos, searchVideosPartial} from '../controllers/searchController';

const router = Router();

/*
 * @route GET /api/search
 * @desc Search videos using MongoDB text index
 * @access Public
 * @query q - Search query
 * @query page - Page number (optional, default: 1)
 * @query limit = Results per page (optional, default: 10)
 */
router.get('/', searchVideos);

/*
 * @route GET /api/search/partial
 * @desc Search videos with partial matching
 * @access Public
 * @query q - Search query
 * @query page - Page number ( optional, default: 1)
 * @query limit - Results per page ( optional, default: 10)
 */
router.get('/partial', searchVideosPartial);

export default router;
