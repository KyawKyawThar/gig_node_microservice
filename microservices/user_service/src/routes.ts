import { config } from './config';
import { Application } from 'express';
import { healthRouter } from './router/health';

export function appRoutes(app: Application): void {
  app.use(config.BUYER_BASE_PATH, healthRouter());
  app.use(config.SELLER_BASE_PATH, healthRouter());
}
