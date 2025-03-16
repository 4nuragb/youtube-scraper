import { Request, Response } from 'express';
import { advancedSearch } from '../src/controllers/advancedSearchController';
import Video from '../src/models/Video';

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
}

describe('Advanced Search Controller', () => {
    beforeEach( async () => {
        const videos = [
            {
                videoId: 'cricket1',
                title: 'Cricket Match Highlights',
                description: 'Exciting cricket match highlights from the Champions Trophy',
                publishedAt: new Date('2025-03-15'),
                thumbnails: {
                    default: { url: 'https://exammple.com/1.jpg', width: 120, height: 90},
                    medium: { url: 'https://example.com/1m.jpg', width: 320, height: 180 },
                    high: { url: 'https://example.com/1h.jpg', width: 480, height: 360 }
                },
                channelTitle: 'Sports Channel',
                channelId: 'sports1',
                tags: ['cricket', 'highlights', 'champions trophy']
            },
            {
                videoId: 'tea1',
                title: 'How to Make Perfect Tea',
                description: 'Learn the art of making the perfect cup of tea',
                publishedAt: new Date('2025-03-10'),
                thumbnails: {
                    default: { url: 'https://example.com/2.jpg', width: 120, height: 90 },
                    medium: { url: 'https://example.com/2m.jpg', width: 320, height: 180 },
                    high: { url: 'https://example.com/2h.jpg', width: 480, height: 360 }
                },
                channelTitle: 'Cooking Channel',
                channelId: 'cooking1',
                tags: ['tea', 'cooking', 'tutorial']
            },
            {
                videoId: 'cricket2',
                title: 'Cricket Tutorial for Beginners',
                description: 'Learn how to play cricket with this beginner tutorial',
                publishedAt: new Date('2025-03-16'),
                thumbnails: {
                    default: { url: 'https://example.com/3.jpg', width: 120, height: 90 },
                    medium: { url: 'https://example.com/3m.jpg', width: 320, height: 180 },
                    high: { url: 'https://example.com/3h.jpg', width: 480, height: 360 }
                },
                channelTitle: 'Sports Channel',
                channelId: 'sports1',
                tags: ['cricket', 'tutorial', 'beginners']
            }
        ];

        await Video.insertMany(videos);
    });

    describe('advancedSearch', () => {
        it('should return all videos when no search parameters are provided', async () => {
            const req = {
                query: {}
            } as unknown as Request;

            const res = mockResponse();

            await advancedSearch(req, res);

            const responseData = (res.json as jest.Mock).mock.calls[0][0];

            expect(responseData.success).toBe(true);
            expect(responseData.count).toBe(3);
            expect(responseData.data[0].videoId).toBe('cricket2');
        });

        it('should search using text index', async () => {
            const req = {
                query: { search: 'cricket' }
            } as unknown as Request;

            const res = mockResponse();

            await advancedSearch(req, res);

            const responseData = (res.json as jest.Mock).mock.calls[0][0];

            expect(responseData.success).toBe(true);
            expect(responseData.count).toBe(2);
            expect(responseData.data[0].title).toContain('cricket');
        });

        it('should perform partial matching when requested', async () => {
            const req = {
                query: { search: 'tea how', partial: 'true'}
            } as unknown as Request;

            const res = mockResponse();

            await advancedSearch(req, res);

            const responseData = (res.json as jest.Mock).mock.calls[0][0];

            expect(responseData.success).toBe(true);
            expect(responseData.count).toBe(1);
            expect(responseData.data[0].videoId).toBe('tea1');
        });

        it('should support sorting by multiple fields', async () => {
            await Video.deleteMany({});
            await Video.insertMany([
                {
                    videoId: 'vid1',
                    title: 'Video 1',
                    description: 'First video',
                    publishedAt: new Date('2025-01-15'),
                    channelId: 'channel1',
                    channelTitle: 'Channel One'
                },
                {
                    videoId: 'vid2',
                    title: 'Video 2',
                    description: 'Second video',
                    publishedAt: new Date('2025-02-15'),
                    channelId: 'channel2',
                    channelTitle: 'Channel Two'
                },
                {
                    videoId: 'vid3',
                    title: 'Video 3',
                    description: 'Third video',
                    publishedAt: new Date('2025-03-15'),
                    channelId: 'channel1',
                    channelTitle: 'Channel One'
                }
            ]);

            const req = {
                query: {
                    sort: 'channelId,publishedAt',
                    order: 'asc,desc'
                }
            } as unknown as Request;

            const res = mockResponse();
            await advancedSearch(req, res);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];

            expect(responseData.sort).toHaveLength(2);
            expect(responseData.sort[0].field).toBe('channelId');
            expect(responseData.sort[0].order).toBe('asc');
            expect(responseData.sort[1].field).toBe('publishedAt');
            expect(responseData.sort[1].order).toBe('desc');

            expect(responseData.data[0].videoId).toBe('vid3');
            expect(responseData.data[1].videoId).toBe('vid1');
            expect(responseData.data[2].videoId).toBe('vid2');
        });

        it('should use default order (desc) if fewer order values than sort fields are provided', async () => {
            const req = {
                query: {
                    sort: 'channelId,publishedAt',
                    order: 'asc'
                }
            } as unknown as Request;

            const res = mockResponse();
            await advancedSearch(req, res);
            const responseData = (res.json as jest.Mock).mock.calls[0][0];
            expect(responseData.sort[0].order).toBe('asc');
            expect(responseData.sort[1].order).toBe('desc');
        });
    })
})
