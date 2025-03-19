import { Application } from 'express';
import { config } from '@review/config';
import { healthRouter } from '@review/router/health';
import { reviewRoutes } from '@review/router/review';
import { verifyReviewGatewayRequest } from '@review/reviewMiddleware';

export function appRoutes(app: Application) {
  app.use('', healthRouter());
  app.use(config.REVIEW_BASE_PATH, verifyReviewGatewayRequest, reviewRoutes());
}
