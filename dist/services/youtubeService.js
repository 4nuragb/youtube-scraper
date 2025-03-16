"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchYoutubeVideos = void 0;
const axios_1 = __importDefault(require("axios"));
const apiKeyManager_1 = require("../utils/apiKeyManager");
const Video_1 = __importDefault(require("../models/Video"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('youtubeService');
const fetchYoutubeVideos = async () => {
    var _a;
    const searchQuery = process.env.SEARCH_QUERY || 'cricket';
    logger.info(`Starting YouTube video fetch for query: "${searchQuery}`);
    try {
        const now = new Date();
        const tenSecondsAgo = new Date(now.getTime() - 60 * 1000);
        const publishedAfter = tenSecondsAgo.toISOString();
        const latestVideo = await Video_1.default.findOne().sort({ publishedAt: -1 });
        let effectivePublishedAfter = publishedAfter;
        if (latestVideo) {
            const latestTimestamp = new Date(latestVideo.publishedAt);
            latestTimestamp.setSeconds(latestTimestamp.getSeconds() + 1);
            effectivePublishedAfter = latestTimestamp.toISOString();
            logger.info(`Using latest video timestamp: ${effectivePublishedAfter}`);
        }
        const response = await fetchFromYouTube(searchQuery, effectivePublishedAfter);
        if (!response.items || response.items.length === 0) {
            logger.info('No new videos found');
            return;
        }
        logger.info(`Found ${response.items.length} new videos`);
        const savedCount = await saveVideos(response.items);
        logger.info(`Successfully saved ${savedCount} new videos to database`);
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 403) {
            logger.error('YouTube API quota exceeded. Rotating to next key.');
            apiKeyManager_1.apiKeyManager.markKeyAsExhausted();
            if (apiKeyManager_1.apiKeyManager.getAvailableKeyCount() > 0) {
                logger.info('Retrying with new API key');
                return (0, exports.fetchYoutubeVideos)();
            }
            else {
                logger.error('All API keys exhausted. Cannot fetch videos at this time.');
            }
        }
        else {
            logger.error('Error fetching videos from YouTube:', error);
        }
        throw error;
    }
};
exports.fetchYoutubeVideos = fetchYoutubeVideos;
const fetchFromYouTube = async (query, publishedAfter) => {
    var _a, _b, _c;
    const API_KEY = apiKeyManager_1.apiKeyManager.getCurrentKey();
    const MAX_RESULTS = 50;
    logger.info(`Fetching videos published after ${publishedAfter}`);
    try {
        const url = 'https://www.googleapis.com/youtube/v3/search';
        const params = {
            key: API_KEY,
            q: query,
            part: 'snippet',
            maxResults: MAX_RESULTS,
            type: 'video',
            order: 'date',
            publishedAfter,
            relevanceLanguage: 'en'
        };
        logger.debug('Sending request to Youtube API');
        const searchResponse = await axios_1.default.get(url, { params });
        const videoIds = (_a = searchResponse === null || searchResponse === void 0 ? void 0 : searchResponse.data) === null || _a === void 0 ? void 0 : _a.items.map((item) => { var _a; return (_a = item === null || item === void 0 ? void 0 : item.id) === null || _a === void 0 ? void 0 : _a.videoId; });
        const videoDetailsResponse = await axios_1.default.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                key: API_KEY,
                id: videoIds.join(','),
                part: 'snippet, statistics'
            }
        });
        apiKeyManager_1.apiKeyManager.incrementUsageCount();
        return videoDetailsResponse.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 403) {
                logger.error('YouTube API quota exceeded or authentication error');
                throw error;
            }
            else if (((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 400) {
                logger.error('Bad request to YouTube API:', error.response.data);
                throw error;
            }
        }
        logger.error('Failed to fetch from YouTube API:', error);
        throw error;
    }
};
const saveVideos = async (videos) => {
    let savedCount = 0;
    const batchSize = 10;
    const batches = Math.ceil(videos.length / batchSize);
    for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, videos.length);
        const batch = videos.slice(start, end);
        const savePromises = batch.map(video => saveVideo(video));
        const results = await Promise.allSettled(savePromises);
        savedCount += results.filter(result => result.status === 'fulfilled').length;
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                logger.error(`Failed to save video ${batch[index].id}:`, result.reason);
            }
        });
    }
    return savedCount;
};
const saveVideo = async (video) => {
    var _a;
    try {
        const existingVideo = await Video_1.default.findOne({ videoId: video.id });
        if (existingVideo) {
            return existingVideo;
        }
        const newVideo = new Video_1.default({
            videoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description || 'No description available',
            publishedAt: new Date(video.snippet.publishedAt),
            thumbnails: video.snippet.thumbnails,
            channelTitle: video.snippet.channelTitle,
            channelId: video.snippet.channelId,
            tags: (_a = video.snippet) === null || _a === void 0 ? void 0 : _a.tags,
            viewCount: video.statistics.viewCount,
            likeCount: video.statistics.likeCount
        });
        const savedVideo = await newVideo.save();
        logger.debug(`Saved video: ${savedVideo.title}`);
        return savedVideo;
    }
    catch (error) {
        logger.error(`Error saving video ${video.id}:`, error);
        throw error;
    }
};
