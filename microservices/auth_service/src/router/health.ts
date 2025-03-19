import express, { Router } from 'express';
import { authHealthCheck } from '@auth/controller/health';

const router: Router = express.Router();

export function healthRouter(): Router {
  router.get('/auth-health', authHealthCheck);

  return router;
}
