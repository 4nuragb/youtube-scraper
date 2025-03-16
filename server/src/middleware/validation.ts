import { query, validationResult} from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if( !errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map((error: any) => ({
                location: error.location,
                path: error.path,
                msg: error.msg
            }))
        });
    }
    next();
}

export const advancedSearchValidation = [
    query('search')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Search query must be less than 200 characters')
        .escape(),
    query('partial')
        .optional()
        .isIn(['true', 'false']).withMessage('Partial must be either "true" or "false"'),
    query('tags')
        .optional()
        .custom((value) => {
            if( value) {
                const tags = value.split(',').map((tag: string) => tag.trim());
                if( tags.some((tag: string) => tag.length > 50)) {
                    throw new Error('Each tag must be less than 50 characters');
                }
                return true;
            }
            return true;
        }),
    query('channelId')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 100}).withMessage('Channel ID must be less than 100 characters'),
    query('startDate')
        .optional()
        .isDate().withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    query('endDate')
        .optional()
        .isDate().withMessage('End Date must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if( req?.query?.startDate && new Date(value) < new Date(req.query.startDate)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('sort')
        .optional()
        .custom((value) => {
            if( value) {
                const sortFields = value.split(',').map((field: string) => field.trim());
                const validFields = ['publishedAt', 'title', 'description', 'channelTitle', 'channelId', 'viewCount', 'likeCount'];
                if( sortFields.some((field: string) => !validFields.includes(field))) {
                    throw new Error('Sort fields must be one of: publishedAt, title, description, channelTitle, channelId, viewCount, likeCount');
                }
                return true;
            }
            return true;
        }),
    query('order')
        .optional()
        .custom((value) => {
            if( value) {
                const orders = value.split(',').map((order: string) => order.trim());
                if( orders.some((order: string) => !['asc', 'desc'].includes(order))) {
                    throw new Error('Sort order value must be either "asc" or "desc"');
                }
            }
            return true;
        }),
    validateRequest
];
