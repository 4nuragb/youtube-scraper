import axios from 'axios';
import { apiKeyManager } from '../utils/apiKeyManager';
import Video, {IVideo} from '../models/Video';
import { createLogger} from '../utils/logger';
import { YouTubeThumbnail} from "youtube";

const logger = createLogger('youtubeService');

interface YoutubeThumbnail {
    url: string;
    width: number;
    height: number;
}

interface YouTubeVideoSnippet {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
        default: YouTubeThumbnail;
        medium: YouTubeThumbnail;
        high: YouTubeThumbnail;
        standard: YouTubeThumbnail;
        maxres: YouTubeThumbnail;
    },
    channelTitle: string;
    tags?: string[];
}

interface YouTubeVideo {
    id: {
        kind: string;
        videoId: string;
    };
    snippet: YouTubeVideoSnippet;
}

interface YouTubeApiResponse {
    kind: string;
    etag: string;
    nextPageToken?: string;
    regionCode?: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YouTubeVideo[];
}

export const fetchYoutubeVideos = async (): Promise<void> => {
    const searchQuery = process.env.SEARCH_QUERY || 'cricket';
    logger.info(`Starting YouTube video fetch for query: "${searchQuery}`);
    try {
        const now = new Date();
        const tenSecondsAgo = new Date(now.getTime() - 10 * 1000);
        const publishedAfter = tenSecondsAgo.toISOString();
        const latestVideo = await Video.findOne().sort({ publishedAt: -1});

        let effectivePublishedAfter = publishedAfter;
        if( latestVideo) {
            const latestTimestamp = new Date(latestVideo.publishedAt);
            latestTimestamp.setSeconds(latestTimestamp.getSeconds() + 1);
            effectivePublishedAfter = latestTimestamp.toISOString();
            logger.info(`Using latest video timestamp: ${effectivePublishedAfter}`);
        }

        const response = await fetchFromYouTube(searchQuery, effectivePublishedAfter);

        if( !response.items || response.items.length === 0) {
            logger.info('No new videos found');
            return;
        }

        logger.info(`Found ${response.items.length} new videos`);

        const savedCount = await saveVideos(response.items);

        logger.info(`Successfully saved ${savedCount} new videos to database`);
    } catch( error) {
        if( axios.isAxiosError(error) && error.response?.status === 403) {
            logger.error('YouTube API quota exceeded. Rotating to next key.');
            apiKeyManager.markKeyAsExhausted();

            if( apiKeyManager.getAvailableKeyCount() > 0) {
                logger.info('Retrying with new API key');
                return fetchYoutubeVideos();
            } else {
                logger.error('All API keys exhausted. Cannot fetch videos at this time.');
            }
        } else {
            logger.error('Error fetching videos from YouTube:', error);
        }
        throw error;
    }
};

const fetchFromYouTube = async (query: string, publishedAfter: string): Promise<YouTubeApiResponse> => {
    const API_KEY = apiKeyManager.getCurrentKey();
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
        const response = await axios.get<YouTubeApiResponse>(url, { params});

        apiKeyManager.incrementUsageCount();

        return response.data;
    } catch( error) {
        if( axios.isAxiosError(error)) {
            if( error.response?.status === 403) {
                logger.error('YouTube API quota exceeded or authentication error');
                throw error;
            } else if( error.response?.status === 400) {
                logger.error('Bad request to YouTube API:', error.response.data);
                throw error;
            }
        }

        logger.error('Failed to fetch from YouTube API:', error);
        throw error;
    }
};

const saveVideos = async (videos: YouTubeVideo[]): Promise<number> => {
    let savedCount = 0;
    const batchSize = 10;
    const batches = Math.ceil(videos.length / batchSize);

    for( let i = 0; i < batches; i ++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, videos.length);
        const batch = videos.slice(start, end);

        const savePromises = batch.map(video => saveVideo(video));
        const results = await Promise.allSettled(savePromises);

        savedCount += results.filter(result => result.status === 'fulfilled').length;

        results.forEach((result, index) => {
            if( result.status === 'rejected') {
                logger.error(`Failed to save video ${batch[index].id.videoId}:`, result.reason);
            }
        });
    }

    return savedCount;
}

const saveVideo = async (video: YouTubeVideo): Promise<IVideo> => {
    try {
        const existingVideo = await Video.findOne({ videoId: video.id.videoId});
        if( existingVideo) {
            return existingVideo;
        }

        const newVideo = new Video( {
            videoId: video.id.videoId,
            title: video.snippet.title,
            description: video.snippet.description || 'No description available',
            publishedAt: new Date(video.snippet.publishedAt),
            thumbnails: video.snippet.thumbnails,
            channelTitle: video.snippet.channelTitle,
            channelId: video.snippet.channelId,
            tags: video.snippet.tags
        });

        const savedVideo = await newVideo.save();
        logger.debug(`Saved video: ${savedVideo.title}`);
        return savedVideo;
    } catch( error) {
        logger.error(`Error saving video ${video.id.videoId}:`, error)
        throw error;
    }
}
