import express, { Router } from 'express';
import { sellerCreate } from '@user/controller/seller/create';
import { randomSeller, sellerById, sellerByUsername } from '@user/controller/seller/get';
import { sellerUpdate } from '@user/controller/seller/update';
import { seed } from '@user/controller/seller/seed';

const router: Router = express.Router();

export const sellerRouter = (): Router => {
  router.post('/create', sellerCreate);
  router.get('/id/:sellerId', sellerById);
  router.get('/username/:sellerUsername', sellerByUsername);
  router.get('/random/:size', randomSeller);
  router.put('/seller/:sellerId', sellerUpdate);
  router.post('/seed/:count', seed);
  return router;
};
