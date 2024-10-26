import { Application } from 'express';

import { verifyAuthGatewayRequest } from './authMiddleware';
import { authRouter } from './router/auth';
import { healthRouter } from './router/health';
import { config } from './config';
import { currentUserRouter } from './router/currentUser';
import { searchRouter } from './router/search';
import { seedRouter } from './router/seed';

export function appRoutes(app: Application): void {
  app.use(config.BASE_PATH, healthRouter());
  app.use(config.BASE_PATH, searchRouter());

  app.use(config.BASE_PATH, verifyAuthGatewayRequest, authRouter());
  app.use(config.BASE_PATH, verifyAuthGatewayRequest, currentUserRouter());

  app.use(config.BASE_PATH, seedRouter());
}
