import { Application } from 'express';

import { healthRoute } from './router/healthRouter';
import { config } from './config';
import { authRoute } from './router/auth';

export const appRoutes = (app: Application) => {
  app.use('', healthRoute.routes());
  app.use(config.BASE_PATH, authRoute.routes());
};
