"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedSearchValidation = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map((error) => ({
                location: error.location,
                path: error.path,
                msg: error.msg
            }))
        });
    }
    next();
};
exports.validateRequest = validateRequest;
exports.advancedSearchValidation = [
    (0, express_validator_1.query)('search')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Search query must be less than 200 characters')
        .escape(),
    (0, express_validator_1.query)('partial')
        .optional()
        .isIn(['true', 'false']).withMessage('Partial must be either "true" or "false"'),
    (0, express_validator_1.query)('tags')
        .optional()
        .custom((value) => {
        if (value) {
            const tags = value.split(',').map((tag) => tag.trim());
            if (tags.some((tag) => tag.length > 50)) {
                throw new Error('Each tag must be less than 50 characters');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('channelId')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 100 }).withMessage('Channel ID must be less than 100 characters'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .isDate().withMessage('Start date must be a valid date (YYYY-MM-DD)'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isDate().withMessage('End Date must be a valid date (YYYY-MM-DD)')
        .custom((value, { req }) => {
        var _a;
        if (((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.startDate) && new Date(value) < new Date(req.query.startDate)) {
            throw new Error('End date must be after start date');
        }
        return true;
    }),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    (0, express_validator_1.query)('sort')
        .optional()
        .custom((value) => {
        if (value) {
            const sortFields = value.split(',').map((field) => field.trim());
            const validFields = ['publishedAt', 'title', 'description', 'channelTitle', 'channelId', 'viewCount', 'likeCount'];
            if (sortFields.some((field) => !validFields.includes(field))) {
                throw new Error('Sort fields must be one of: publishedAt, title, description, channelTitle, channelId, viewCount, likeCount');
            }
            return true;
        }
        return true;
    }),
    (0, express_validator_1.query)('order')
        .optional()
        .custom((value) => {
        if (value) {
            const orders = value.split(',').map((order) => order.trim());
            if (orders.some((order) => !['asc', 'desc'].includes(order))) {
                throw new Error('Sort order value must be either "asc" or "desc"');
            }
        }
        return true;
    }),
    exports.validateRequest
];
