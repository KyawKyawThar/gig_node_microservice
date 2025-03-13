import { Application } from 'express';
import { config } from './config';
import { healthRouter } from './router/health';
import { orderRouter } from '@order/router/order';
import { verifyOrderGatewayRequest } from '@order/orderMiddleware';

export function appRoutes(app: Application) {
  app.use(config.ORDER_BASE_PATH, healthRouter);
  app.use(config.ORDER_BASE_PATH, verifyOrderGatewayRequest, orderRouter);
}
