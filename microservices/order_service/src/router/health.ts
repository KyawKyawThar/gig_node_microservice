import { orderHealthCheck } from '@order/controller/health';
import express, { Router } from 'express';

const router = express.Router();

export function healthRouter(): Router {
  router.get('/order-health', orderHealthCheck);
  return router;
}
