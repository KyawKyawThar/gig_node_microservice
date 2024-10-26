import { gigHealthCheck } from '@gig/controller/health';
import express, { Router } from 'express';

const router = express.Router();
export function healthRouter(): Router {
  router.get('/gig-health', gigHealthCheck);

  return router;
}
