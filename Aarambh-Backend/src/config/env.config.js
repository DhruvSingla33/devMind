import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = Joi.object({
  PORT: Joi.number(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test'),
  MONGODB_URI: Joi.string(),
  JWT_SECRET: Joi.string(),
  JWT_ACCESS_EXPIRATION: Joi.string(),
  JWT_REFRESH_SECRET: Joi.string(),
  JWT_REFRESH_EXPIRATION: Joi.string(),
  GOOGLE_CLIENT_ID: Joi.string().allow('', null),
  AWS_REGION: Joi.string().allow('', null),
  AWS_ACCESS_KEY_ID: Joi.string().allow('', null),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('', null),
  AWS_S3_BUCKET_NAME: Joi.string().allow('', null),
  REDIS_HOST: Joi.string().allow('', null),
  REDIS_PORT: Joi.number().allow(null),
  SMTP_HOST: Joi.string().allow('', null),
  SMTP_PORT: Joi.number().allow(null),
  SMTP_USER: Joi.string().allow('', null),
  SMTP_PASS: Joi.string().allow('', null),
})
  .unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  console.warn(`[Config Warning] Environment validation warning: ${error.message}`);
}

export const envConfig = {
  port: envVars.PORT || process.env.PORT || 5000,
  env: envVars.NODE_ENV || process.env.NODE_ENV || 'development',
  mongoose: {
    url: envVars.MONGODB_URI || process.env.MONGODB_URI,
  },
  jwt: {
    secret: envVars.JWT_SECRET || process.env.JWT_SECRET,
    accessExpiration: envVars.JWT_ACCESS_EXPIRATION || process.env.JWT_ACCESS_EXPIRATION,
    refreshSecret: envVars.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET,
    refreshExpiration: envVars.JWT_REFRESH_EXPIRATION || process.env.JWT_REFRESH_EXPIRATION,
  },
  google: {
    clientId: envVars.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
  },
  aws: {
    region: envVars.AWS_REGION || process.env.AWS_REGION,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: envVars.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME,
  },
  redis: {
    host: envVars.REDIS_HOST || process.env.REDIS_HOST || '127.0.0.1',
    port: envVars.REDIS_PORT || process.env.REDIS_PORT || 6379,
  },
};

