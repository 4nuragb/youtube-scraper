import { Request, Response } from "express";
import Video from '../models/Video';
import { createLogger } from '../utils/logger';

const logger = createLogger('advancedSearchController');

interface AdvancedSearchQuery {
    page?: string;
    limit?: string;
    search?: string;
    partial?: string;
    tags?: string;
    channelId?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    order?: string;
}

export const advancedSearch = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = req.query as AdvancedSearchQuery;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '10');
        const skip = (page - 1) * limit;

        const {
            search,
            partial,
            tags,
            channelId,
            startDate,
            endDate,
            sort,
            order
        } = query;

        logger.info(`Advanced Search with params: ${JSON.stringify(query)}`);

        let mongoQuery: any = {};

        // Handling text search
        if( search && typeof search === 'string') {
            if( partial === 'true') {
                const searchTerms = search.trim().split(/\s+/).filter(term => term.length > 0);
                const regexPatterns = searchTerms.map(term => new RegExp(term, 'i'));
                const orConditions = [];
                for( const pattern of regexPatterns) {
                    orConditions.push({ title: pattern });
                    orConditions.push({ description: pattern });
                }

                mongoQuery.$or = orConditions;
            } else {
                mongoQuery.$text = { $search: search };
            }
        }

        if( tags && typeof tags === 'string') {
            const tagList = tags.split(',').map(tag => tag.trim());
            if( tagList.length === 1) {
                mongoQuery.tags = tagList[0];
            } else {
                mongoQuery.tags = { $in: tagList };
            }
        }

        if( channelId && typeof channelId === 'string') {
            mongoQuery.channelId = channelId;
        }

        if( (startDate && typeof startDate === 'string') ||
            (endDate && typeof endDate === 'string')) {
            const dateRange: any = {};

            if( startDate) {
                dateRange.$gte = new Date(startDate);
            }

            if( endDate) {
                dateRange.$lte = new Date(endDate);
            }

            mongoQuery.publishedAt = dateRange;
        }

        const total = await Video.countDocuments(mongoQuery);

        let sortOptions: any = {publishedAt: -1};

        // If custom sorting is requested
        if( sort) {
            sortOptions = {};
            let isPublishedAtPresent = false;
            const sortFields = sort.split(',').map(field => field.trim());
            let orderValues: ('asc' | 'desc')[] = [];
            if( order) {
                orderValues = order.split(',').map(o => o.trim() as 'asc' | 'desc');
            }
            sortFields.forEach((field, index) => {
                const sortOrder = orderValues[index] ? (orderValues[index] === 'asc' ? 1 : -1) : -1;
                sortOptions[field] = sortOrder;
                if( field === 'publishedAt') {
                    isPublishedAtPresent = true;
                }
            });
            if( !isPublishedAtPresent) {
                sortOptions.publishedAt = -1
            }
        }

        if( search && partial !== 'true') {
            sortOptions = {
                score: { $meta: 'textScore' },
                ...sortOptions
            };
        }

        let videosQuery: any = Video.find(mongoQuery);

        if( search && partial !== 'true') {
            videosQuery = videosQuery.select({ score: { $meta: 'textScore' } });
        }

        const videos = await videosQuery
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .select('-__v');

        const totalPages = Math.ceil(total / limit);

        let sortInfo = [];
        if( sort) {
            let isPublishedAtPresent = false;
            const sortFields = sort.split(',').map(field => field.trim());
            const orderValues = order ? order.split(',').map(o => o.trim()) : [];

            sortInfo = sortFields.map((field, index) => {
                if( field === 'publishedAt') {
                    isPublishedAtPresent = true;
                }
                return {
                    field,
                    order: orderValues[index] || 'asc'
                }
            });
            if( !isPublishedAtPresent) {
                sortInfo.push({ field: 'publishedAt', order: 'desc' });
            }
        } else {
            sortInfo = [{ field: 'publishedAt', order: 'desc' }];
        }

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
            sort: sortInfo,
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
    } catch( error) {
        logger.error('Error in advanced search:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform search'
        });
    }
}
