// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors'
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

import connectDB from './config/db';

import videoRoutes from './routes/videoRoutes';
import searchRoutes  from './routes/searchRoutes';

import { initYoutubeScheduler } from "./cron/youtubeScheduler";

import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Apply rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many request from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Health check route
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});


// API routes
app.use('/api/videos', videoRoutes);
app.use('/api/search', searchRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
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
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack});

    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong'
    });
});

// Connect to database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        // Start the server
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });
        // Initialize the YouTube video fetch scheduler
        initYoutubeScheduler();
    } catch( error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error, promise) => {
    logger.error('Unhandled Rejection:', reason);
    // Don't exit the process in production, just log it
    if( process.env.NODE_ENV !== 'production' ) {
        process.exit(1);
    }
})

export default app;
