import { Application } from 'express';
import { config } from './config';
import { healthRouter } from './router/health';

import { verifyGigGatewayRequest } from './gigMiddleware';
import { gigRouter } from './router/gig';

export function appRoutes(app: Application) {
  app.use(config.GIG_BASE_PATH, healthRouter());

  app.use(config.GIG_BASE_PATH, verifyGigGatewayRequest, gigRouter());
}
