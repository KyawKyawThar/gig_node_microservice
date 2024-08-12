import express, { Router } from 'express';
import { gigs, singleElementByGig } from '@auth/controller/search';
const router: Router = express.Router();

export function searchRouter(): Router {
  router.get('/search/gigs/:from/:size/:type', gigs);
  router.get('/search/gig/:gigId', singleElementByGig);

  return router;
}
