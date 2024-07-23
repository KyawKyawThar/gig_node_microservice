import { Application } from 'express';

import { healthRoute } from './router/healthRouter';

export const appRoutes = (app: Application) => {
  app.use('', healthRoute.routes());
};
