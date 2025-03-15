"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const config = {
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
    port: parseInt(process.env.PORT || '3000', 10),
    mongo: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-fetcher',
        options: {
            autoIndex: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        }
    },
    youtube: {
        apiKeys: (process.env.YOUTUBE_API_KEYS || '').split(',').map(key => key.trim()).filter(key => key.length > 0),
        searchQuery: process.env.SEARCH_QUERY || 'cricket',
        fetchIntervalSeconds: parseInt(process.env.YOUTUBE_FETCH_INTERVAL || '10', 10)
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        dir: process.env.LOG_DIR || path_1.default.join(process.cwd(), 'logs')
    },
    api: {
        prefix: '/api',
        rateLimitWindow: 15 * 60 * 1000,
        rateLimitMax: 100
    }
};
if (config.youtube.apiKeys.length === 0) {
    throw new Error('No YouTube API keys provided. Please set YOUTUBE_API_KEYS in your .env file.');
}
exports.default = config;
