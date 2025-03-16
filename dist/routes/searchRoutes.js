"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
const advancedSearchController_1 = require("../controllers/advancedSearchController");
const router = (0, express_1.Router)();
/*
 * @route GET /api/search
 * @desc Search videos using MongoDB text index
 * @access Public
 * @query q - Search query
 * @query page - Page number (optional, default: 1)
 * @query limit = Results per page (optional, default: 10)
 */
router.get('/', searchController_1.searchVideos);
/*
 * @route GET /api/search/partial
 * @desc Search videos with partial matching
 * @access Public
 * @query q - Search query
 * @query page - Page number ( optional, default: 1)
 * @query limit - Results per page ( optional, default: 10)
 */
router.get('/partial', searchController_1.searchVideosPartial);
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
router.get('/advanced', advancedSearchController_1.advancedSearch);
exports.default = router;
