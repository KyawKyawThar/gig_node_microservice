import { config } from '@gig/config';
import { v2 as cloudinary } from 'cloudinary';
import express, { Express } from 'express';
import { start } from './server';
import { createRedisConnection } from './redis/redis.connection';
import { databaseConnection } from './database';

function cloudinaryConfig(): void {
  cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.CLOUD_API_KEY,
    api_secret: config.CLOUD_API_SECRET
  });
}

const initialize = async (): Promise<void> => {
  cloudinaryConfig();
  const app: Express = express();
  databaseConnection();
  start(app);
  await createRedisConnection();
};

initialize();
