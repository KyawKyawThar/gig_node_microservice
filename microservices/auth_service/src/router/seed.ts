import { createSeed } from '@auth/controller/seed';
import express, { Router } from 'express';

const router: Router = express.Router();

export function seedRouter(): Router {
  router.post('/seed/:count', createSeed);
  return router;
}
