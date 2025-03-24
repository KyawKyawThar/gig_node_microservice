import { Application } from 'express';
import { ErrorHandlerController } from '@gateway/controller/errorHandler';
import { healthRoute } from '@gateway/router/healthRouter';
import { config } from '@gateway/config';
import { authRoute } from '@gateway/router/authRouter';
import { searchRoute } from '@gateway/router/searchRouter';
import { authMiddleware } from '@gateway/services/auth-middleware';
import { currentUserRoute } from '@gateway/router/currentUserRouter';
import { sellerRoute } from '@gateway/router/sellerRouter';
import { buyerRoute } from '@gateway/router/buyerRouter';
import { gigRoute } from '@gateway/router/gigRouter';
import { chatRoute } from '@gateway/router/chatRouter';
import { orderRoute } from '@gateway/router/orderRouter';
import { reviewRoute } from '@gateway/router/reviewRouter';

export const appRoutes = (app: Application) => {
  app.use('', healthRoute.routes());

  app.use(config.BASE_PATH, authRoute.routes());
  app.use(config.BASE_PATH, searchRoute.routes());

  app.use(config.BASE_PATH, authMiddleware.verifyUser, sellerRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, buyerRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, gigRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, chatRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, orderRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, reviewRoute.routes());

  // Handle invalid endpoints
  app.use('*', ErrorHandlerController.handleNotFound);
  // Global error handler
  app.use(ErrorHandlerController.handleGlobalErrors);
};
