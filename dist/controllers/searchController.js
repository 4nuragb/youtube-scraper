"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchVideosPartial = exports.searchVideos = void 0;
const Video_1 = __importDefault(require("../models/Video"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('searchController');
const searchVideos = async (req, res) => {
    try {
        const { q } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: 'A search query (q) is required'
            });
            return;
        }
        logger.info(`Searching videos for query: "${q}", page=${page}, limit=${limit}`);
        const query = { $text: { $search: q } };
        const total = await Video_1.default.countDocuments(query);
        const videos = await Video_1.default.find(query, {
            score: { $meta: 'textScore' }
        })
            .sort({
            score: { $meta: 'textScore' },
            publishedAt: -1
        })
            .skip(skip)
            .limit(limit)
            .select('-__v');
        const totalPages = Math.ceil(total / limit);
        res.json({
            success: true,
            count: videos.length,
            total,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            data: videos
        });
        logger.debug(`Returned ${videos.length} video results for search query "${q}"`);
    }
    catch (error) {
        logger.error('Error searching videos:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search videos'
        });
    }
};
exports.searchVideos = searchVideos;
const searchVideosPartial = async (req, res) => {
    try {
        const { q } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            res.status(400).json({
                success: false,
                error: 'A search query (q) is required'
            });
            return;
        }
        logger.info(`Partial search fro query: "${q}", page=${page}, limit=${limit}`);
        const searchTerms = q.trim().split(/\s+/).filter(term => term.length > 0);
        const regexPatterns = searchTerms.map(term => new RegExp(term, 'i'));
        const orConditions = [];
        for (const pattern of regexPatterns) {
            orConditions.push({ title: pattern });
            orConditions.push({ description: pattern });
        }
        const query = { $or: orConditions };
        const total = await Video_1.default.countDocuments(query);
        const videos = await Video_1.default.find(query)
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v');
        const totalPages = Math.ceil(total / limit);
        res.json({
            success: true,
            count: videos.length,
            total,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            data: videos
        });
        logger.debug(`Returned ${videos.length} partial match results for search query "${q}"`);
    }
    catch (error) {
        logger.error('Error performing partial search:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search videos'
        });
    }
};
exports.searchVideosPartial = searchVideosPartial;
