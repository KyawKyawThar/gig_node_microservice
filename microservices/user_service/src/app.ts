import express, { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';

import { config } from './config';
import { databaseConnection } from './database';
import { start } from './server';

function cloudinaryConfig(): void {
  cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.CLOUD_API_KEY,
    api_secret: config.CLOUD_API_SECRET
  });
}

const initialize = (): void => {
  cloudinaryConfig();
  const app: Express = express();
  databaseConnection();
  start(app);
};

initialize();
