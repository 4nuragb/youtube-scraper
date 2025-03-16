import { Router} from 'express';
import {advancedSearch} from "../controllers/advancedSearchController";

const router = Router();

/*
 * @route GET /api/search/advanced
 * @desc Advanced search with multiple filters
 * @access Public
 * @query search - Text to search in titles and descriptions
 * @query partial - Set to "true" for partial matching instead of full-text search
 * @query tags - Comma-separated list of tags to filter by
 * @query channelId - Filter by specific channel
 * @query startDate - Filter videos published on or after this date (YYYY-MM-DD)
 * @query endDate - Filter videos published on or before this date (YYYY-MM-DD)
 * @query page - Page number ( optional, default: 1)
 * @query limit - Results per page ( optional, default: 10)
 */
router.get('/advanced', advancedSearch)

export default router;
