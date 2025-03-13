import express, { Router } from 'express';
import { reviewHealthCheck } from '@review/controller/health';

const router = express.Router();

export function healthRouter(): Router {
  router.get('/review-health', reviewHealthCheck);

  return router;
}
