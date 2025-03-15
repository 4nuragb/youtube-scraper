import { createLogger as createWinstonLogger, format, transports, Logger} from 'winston';

export const createLogger = (module: string): Logger => {
    return createWinstonLogger({
        level: process.env.LOG_LEGEL || 'info',
        format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(),
            format.json()
        ),
        defaultMeta: { service: 'youtube-fetcher', module },
        transports: [
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.printf(({ timestamp, level, message, module, ...meta }) => {
                        return `${timestamp} [${module}] ${level}: ${message} ${
                            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
                        }`;
                    })
                )
            }),
            ...(process.env.NODE_ENV === 'production' ? [
                new transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    maxsize: 5242880,
                    maxFiles: 5
                }),
                new transports.File({
                    filename: 'logs/combined.log',
                    maxsize: 5242880,
                    maxFiles: 5
                })
            ] : [])
        ]
    });
};

export default createLogger('app');
