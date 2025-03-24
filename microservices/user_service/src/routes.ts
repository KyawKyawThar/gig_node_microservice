import { config } from './config';
import { Application } from 'express';
import { healthRouter } from './router/health';
import { verifyBuyerGatewayRequest, verifySellerGatewayRequest } from '@user/userMiddleware';
import { buyerRouter } from '@user/router/buyer';
import { sellerRouter } from '@user/router/seller';
import { sellerSeedRouter } from './router/seed';

export function appRoutes(app: Application): void {
  app.use('', healthRouter());

  app.use(config.SELLER_BASE_PATH, sellerSeedRouter());

  app.use(config.BUYER_BASE_PATH, verifyBuyerGatewayRequest, buyerRouter());
  app.use(config.SELLER_BASE_PATH, verifySellerGatewayRequest, sellerRouter());
}
