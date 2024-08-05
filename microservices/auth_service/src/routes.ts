import { Application } from 'express';

import { verifyGatewayRequest } from './authMiddleware';
import { authRouter } from './router/auth';
import { healthRouter } from './router/health';
import { config } from './config';
import { currentUserRouter } from './router/currentUser';

export function appRoutes(app: Application): void {
  app.use(config.BASE_PATH, healthRouter());

  app.use(config.BASE_PATH, verifyGatewayRequest, authRouter());
  app.use(config.BASE_PATH, verifyGatewayRequest, currentUserRouter());
}
