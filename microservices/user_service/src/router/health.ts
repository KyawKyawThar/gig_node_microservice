import { usersRouteHealthCheck } from '@user/controller/health';
import express, { Router } from 'express';

const router: Router = express.Router();
export function healthRouter(): Router {
  router.get('/user-health', usersRouteHealthCheck);
  return router;
}
