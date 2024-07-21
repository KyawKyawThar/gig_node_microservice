import express, { Express } from 'express';
import { Logger } from 'winston';
import { winstonLogger } from '@notifications/logger';
import { config } from '@notifications/config';
import { start } from '@notifications/server';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationAppServer', 'debug');

function initialize(): void {
  const app: Express = express();
  logger.info('Notification service initialized');
  start(app);
}

initialize();
