import { Application } from 'express';
import { healthRoute } from '@gateway/router/healthRouter';
import { config } from '@gateway/config';
import { authRoute } from '@gateway/router/authRouter';
import { authMiddleware } from '@gateway/services/auth-middleware';
import { currentUserRoute } from '@gateway/router/currentUserRouter';
import { searchRoute } from '@gateway/router/searchRouter';
import { sellerRoute } from '@gateway/router/sellerRouter';
import { buyerRoute } from '@gateway/router/buyerRouter';
import { gigRoute } from '@gateway/router/gigRouter';

export const appRoutes = (app: Application) => {
  app.use('', healthRoute.routes());

  app.use(config.BASE_PATH, authRoute.routes());
  app.use(config.BASE_PATH, searchRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, sellerRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, buyerRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, gigRoute.routes());
};
