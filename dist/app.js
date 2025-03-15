"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Load environment variables
dotenv_1.default.config();
const db_1 = __importDefault(require("./config/db"));
const videoRoutes_1 = __importDefault(require("./routes/videoRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const youtubeScheduler_1 = require("./cron/youtubeScheduler");
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Security middleware
app.use((0, helmet_1.default)());
// Enable CORS
app.use((0, cors_1.default)());
// Parse JSON body
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Apply rate limiter
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many request from this IP, please try again after 15 minutes'
});
app.use(limiter);
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});
// API routes
app.use('/api/videos', videoRoutes_1.default);
app.use('/api/search', searchRoutes_1.default);
// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'YouTube Video Fetcher API',
        documentation: '/api/docs',
        endpoints: {
            videos: '/api/videos',
            search: '/api/search',
            partialSearch: '/api/search/partial'
        }
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});
// Error handler
app.use((err, req, res, next) => {
    logger_1.default.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong'
    });
});
// Connect to database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await (0, db_1.default)();
        // Start the server
        app.listen(PORT, () => {
            logger_1.default.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });
        // Initialize the YouTube video fetch scheduler
        (0, youtubeScheduler_1.initYoutubeScheduler)();
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection:', reason);
    // Don't exit the process in production, just log it
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});
exports.default = app;
