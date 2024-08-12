import { Application } from 'express';

import { healthRoute } from './router/healthRouter';
import { config } from './config';
import { authRoute } from './router/authRouter';
import { authMiddleware } from './services/auth-middleware';
import { currentUserRoute } from './router/currentUserRouter';
import { searchRoute } from './router/searchRouter';

export const appRoutes = (app: Application) => {
  app.use('', healthRoute.routes());

  app.use(config.BASE_PATH, authRoute.routes());
  app.use(config.BASE_PATH, searchRoute.routes());
  app.use(config.BASE_PATH, authMiddleware.verifyUser, currentUserRoute.routes());
};
