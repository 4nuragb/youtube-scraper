"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const videoController_1 = require("../controllers/videoController");
const router = (0, express_1.Router)();
/*
 * @route GET /api/videos
 * @desc Get videos with pagination
 * @access Public
 */
router.get('/', videoController_1.getVideos);
/*
 * @route GET /api/videos/:id
 * @desc Get a single video by ID
 * @access Public
 */
router.get('/:id', videoController_1.getVideoById);
exports.default = router;
