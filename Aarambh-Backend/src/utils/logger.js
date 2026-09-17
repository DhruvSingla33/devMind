import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `[${timestamp}] [${level}]: ${message} ${metaStr}`;
      })
    ),
  }),
];

// If AWS Credentials present, attach AWS CloudWatch Stream transport
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  try {
    transports.push(
      new WinstonCloudWatch({
        logGroupName: process.env.AWS_CLOUDWATCH_LOG_GROUP || '/aws/aarambh-backend/api-logs',
        logStreamName: `${process.env.NODE_ENV || 'development'}-${new Date().toISOString().split('T')[0]}`,
        awsRegion: process.env.AWS_REGION || 'ap-south-1',
        awsOptions: {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        },
        jsonMessage: true,
      })
    );
    console.log('[CloudWatch Logger] Stream transport attached to AWS CloudWatch');
  } catch (err) {
    console.warn('[CloudWatch Logger Warning]: Could not initialize CloudWatch transport:', err.message);
  }
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports,
});
