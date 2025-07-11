import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const LOG_LEVELS = {
    BASIC: 'basic',
    DEBUG: 'debug',
    FULL: 'full'
};

const loggerFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const createFileTransport = (level) => {
    return new DailyRotateFile({
        filename: `logs/%DATE%-${level}.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
    });
};

export function setupLogger() {
    const loggingType = (process.env.LOG_LEVEL || 'basic').toLowerCase();
    const isLocal = process.env.ENV === "dev"; 

    if (!isLocal) {
        return {
            info: () => { },
            error: () => { },
            debug: () => { },
            warn: () => { },
            startOperation: () => { },
            endOperation: () => { },
            failOperation: () => { },
        };
    }

    const logger = winston.createLogger({
        format: loggerFormat
    });

    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));

    switch (loggingType) {
        case LOG_LEVELS.FULL:
            logger.add(createFileTransport('full'));
            logger.level = 'silly'; // Most verbose level
            break;

        case LOG_LEVELS.DEBUG:
            logger.add(createFileTransport('debug'));
            logger.level = 'debug';
            break;

        case LOG_LEVELS.BASIC:
        default:
            logger.add(createFileTransport('basic'));
            logger.level = 'info';
            break;
    }

    logger.startOperation = (operationName, data = {}) => {
        logger.info(`Starting ${operationName}`, {
            operation: operationName,
            status: 'start',
            ...data
        });
    };

    logger.endOperation = (operationName, data = {}) => {
        logger.info(`Completed ${operationName}`, {
            operation: operationName,
            status: 'end',
            ...data
        });
    };

    logger.failOperation = (operationName, error, data = {}) => {
        logger.error(`Failed ${operationName}`, {
            operation: operationName,
            status: 'error',
            error: error.message,
            stack: error.stack,
            ...data
        });
    };

    return logger;
}

export const logger = setupLogger();