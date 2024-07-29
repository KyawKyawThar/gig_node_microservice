import { Application } from 'express';

import { verifyGatewayRequest } from './authMiddleware';
import { authRouter } from './router/auth';
import { config } from './config';

export function appRoutes(app: Application): void {
  app.use(config.BASE_PATH, verifyGatewayRequest, authRouter());
}
