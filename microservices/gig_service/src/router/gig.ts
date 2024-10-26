import { gigsByCreate } from '@gig/controller/create';
import { deleteGig } from '@gig/controller/delete';
import { gigById, sellerGigsById, sellerInactiveGigs, similarGigs } from '@gig/controller/get';
import { gigs } from '@gig/controller/search';
import { gigBySeed } from '@gig/controller/seed';
import { gigsByUpdate, activeUpdateGigs } from '@gig/controller/update';
import { Router } from 'express';

const router = Router();

export const gigRouter = (): Router => {
  router.get('/:gigId', gigById);
  router.get('/seller/:sellerId', sellerGigsById);
  router.get('/seller/pause/:sellerId', sellerInactiveGigs);
  // router.get('/category/:username', gigByCategory);
  // router.get('/top/:username', topRatedGigsByCategory);
  router.get('/search/:from/:size/:type', gigs);
  router.get('/similar/:gigId', similarGigs);
  router.post('/create', gigsByCreate);
  router.put('/:gigId', gigsByUpdate);
  router.post('/seed/:count', gigBySeed);
  router.put('/active/:gigId', activeUpdateGigs);
  router.delete('/:gigId/:sellerId', deleteGig);

  return router;
};
