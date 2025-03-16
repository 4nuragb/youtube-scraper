"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initYoutubeScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const youtubeService_1 = require("../services/youtubeService");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.createLogger)('youtubeScheduler');
const initYoutubeScheduler = () => {
    const fetchIntervalSeconds = parseInt(process.env.YOUTUBE_FETCH_INTERVAL || '10', 10);
    const minIntervalSeconds = 5;
    const effectiveInterval = Math.max(fetchIntervalSeconds, minIntervalSeconds);
    logger.info(`Initializing YouTube fetch scheduler to run every ${effectiveInterval} seconds`);
    const cronExpression = `*/${effectiveInterval} * * * * *`;
    const task = node_cron_1.default.schedule(cronExpression, async () => {
        logger.debug('Running scheduled YouTube video fetch');
        try {
            await (0, youtubeService_1.fetchYoutubeVideos)();
        }
        catch (error) {
            logger.error('Scheduled fetch failed:', error);
        }
    });
    task.start();
    logger.info('YouTube scheduler started successfully');
    process.on('SIGINT', () => {
        logger.info('Stopping YouTube scheduler');
        task.stop();
    });
    process.on('SIGTERM', () => {
        logger.info('Stopping YouTube scheduler');
        task.stop();
    });
};
exports.initYoutubeScheduler = initYoutubeScheduler;
