"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedSearch = void 0;
const Video_1 = __importDefault(require("../models/Video"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('advancedSearchController');
const advancedSearch = async (req, res) => {
    try {
        const query = req.query;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '10');
        const skip = (page - 1) * limit;
        const { search, partial, tags, channelId, startDate, endDate } = query;
        logger.info(`Advanced Search with params: ${JSON.stringify(query)}`);
        let mongoQuery = {};
        // Handling text search
        if (search && typeof search === 'string') {
            if (partial === 'true') {
                const searchTerms = search.trim().split(/\s+/).filter(term => term.length > 0);
                const regexPatterns = searchTerms.map(term => new RegExp(term, 'i'));
                const orConditions = [];
                for (const pattern of regexPatterns) {
                    orConditions.push({ title: pattern });
                    orConditions.push({ description: pattern });
                }
                mongoQuery.$or = orConditions;
            }
            else {
                mongoQuery.$text = { $search: search };
            }
        }
        if (tags && typeof tags === 'string') {
            const tagList = tags.split(',').map(tag => tag.trim());
            if (tagList.length === 1) {
                mongoQuery.tags = tagList[0];
            }
            else {
                mongoQuery.tags = { $in: tagList };
            }
        }
        if (channelId && typeof channelId === 'string') {
            mongoQuery.channelId = channelId;
        }
        if ((startDate && typeof startDate === 'string') ||
            (endDate && typeof endDate === 'string')) {
            const dateRange = {};
            if (startDate) {
                dateRange.$gte = new Date(startDate);
            }
            if (endDate) {
                dateRange.$lte = new Date(endDate);
            }
            mongoQuery.publishedAt = dateRange;
        }
        const total = await Video_1.default.countDocuments(mongoQuery);
        let sort = { publishedAt: -1 };
        if (search && partial !== 'true') {
            sort = { score: { $meta: 'textScore' }, publishedAt: -1 };
        }
        let videosQuery = Video_1.default.find(mongoQuery);
        if (search && partial !== 'true') {
            videosQuery = videosQuery.select({ score: { $meta: 'textScore' } });
        }
        const videos = await videosQuery
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-__v');
        const totalPages = Math.ceil(total / limit);
        res.json({
            success: true,
            count: videos.length,
            total,
            filters: {
                search: search || null,
                partial: partial === 'true',
                tags: tags || null,
                channelId: channelId || null,
                dateRange: (startDate || endDate) ? {
                    start: startDate || null,
                    end: endDate || null
                } : null
            },
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
        logger.debug(`Advanced search returned ${videos.length} results`);
    }
    catch (error) {
        logger.error('Error in advanced search:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform search'
        });
    }
};
exports.advancedSearch = advancedSearch;
