import express, { Router } from 'express';
import { review } from '@review/controller/create';
import { reviewsByGigId, reviewsBySellerId } from '@review/controller/get';

const router: Router = express.Router();

const reviewRoutes = (): Router => {
  router.get('/gig/:gigId', reviewsByGigId);
  router.get('/seller/:sellerId', reviewsBySellerId);
  router.post('/', review);

  return router;
};

export { reviewRoutes };
