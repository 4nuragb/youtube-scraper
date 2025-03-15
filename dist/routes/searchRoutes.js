"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
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
exports.default = router;
