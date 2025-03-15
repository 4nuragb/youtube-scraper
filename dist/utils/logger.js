"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
const winston_1 = require("winston");
const createLogger = (module) => {
    return (0, winston_1.createLogger)({
        level: process.env.LOG_LEGEL || 'info',
        format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
        defaultMeta: { service: 'youtube-fetcher', module },
        transports: [
            new winston_1.transports.Console({
                format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(({ timestamp, level, message, module, ...meta }) => {
                    return `${timestamp} [${module}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
                }))
            }),
            ...(process.env.NODE_ENV === 'production' ? [
                new winston_1.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    maxsize: 5242880,
                    maxFiles: 5
                }),
                new winston_1.transports.File({
                    filename: 'logs/combined.log',
                    maxsize: 5242880,
                    maxFiles: 5
                })
            ] : [])
        ]
    });
};
exports.createLogger = createLogger;
exports.default = (0, exports.createLogger)('app');
