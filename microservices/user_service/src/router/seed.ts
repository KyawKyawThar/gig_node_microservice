import express, { Router } from 'express';
import { seed } from '@user/controller/sellerSeed/seed';

const router: Router = express.Router();

export const sellerSeedRouter = (): Router => {
  router.post('/seed/:count', seed);
  return router;
};
