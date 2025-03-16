import cron from 'node-cron';
import { fetchYoutubeVideos} from '../services/youtubeService';
import { createLogger} from '../utils/logger';

const logger = createLogger('youtubeScheduler');

export const initYoutubeScheduler = (): void => {
    const fetchIntervalSeconds = parseInt(process.env.YOUTUBE_FETCH_INTERVAL || '10', 10);
    const minIntervalSeconds = 5;
    const effectiveInterval = Math.max(fetchIntervalSeconds, minIntervalSeconds);

    logger.info(`Initializing YouTube fetch scheduler to run every ${effectiveInterval} seconds`);
    const cronExpression = `*/${effectiveInterval} * * * * *`;
    const task = cron.schedule(cronExpression, async () => {
        logger.debug('Running scheduled YouTube video fetch');
        try {
            await fetchYoutubeVideos();
        } catch( error) {
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
