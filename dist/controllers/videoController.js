"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoById = exports.getVideos = void 0;
const Video_1 = __importDefault(require("../models/Video"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('videoController');
const getVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (page < 1 || limit < 1 || limit > 100) {
            res.status(400).json({
                success: false,
                error: 'Invalid pagination parameters. Page must be ≥ 1 and limit must be between 1 and 100. '
            });
            return;
        }
        logger.info(`Fetching videos: page=${page}, limit=${limit}`);
        const total = await Video_1.default.countDocuments();
        const videos = await Video_1.default.find()
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v'); // Exclude Mongoose version key
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        res.json({
            success: true,
            count: videos.length,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null,
            },
            data: videos
        });
        logger.debug(`Returned ${videos.length} videos for page ${page}`);
    }
    catch (error) {
        logger.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch videos'
        });
    }
};
exports.getVideos = getVideos;
const getVideoById = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info(`Fetching video by ID: ${id}`);
        const video = await Video_1.default.findOne({ videoId: id });
        if (!video) {
            logger.info(`Video with ID ${id} not found`);
            res.status(404).json({
                success: false,
                error: 'Video not found'
            });
            return;
        }
        res.json({
            success: true,
            data: video
        });
    }
    catch (error) {
        logger.error(`Error fetching video ${req.params.id}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch videos'
        });
    }
};
exports.getVideoById = getVideoById;
