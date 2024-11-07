import { Application } from 'express';
import { config } from './config';
import { healthRouter } from './router/health';

export function appRoutes(app: Application) {
  app.use(config.CHATS_BASE_PATH, healthRouter());
}
