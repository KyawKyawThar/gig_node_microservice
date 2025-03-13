import { Create } from '@gateway/controller/gigs/create';
import { Delete } from '@gateway/controller/gigs/delete';
import { Get } from '@gateway/controller/gigs/get';
import { Search } from '@gateway/controller/gigs/search';
import { GigSeed } from '@gateway/controller/gigs/seed';
import { Update } from '@gateway/controller/gigs/update';
import { authMiddleware } from '@gateway/services/auth-middleware';
import { Router } from 'express';

class GigRoute {
  private readonly router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.get('/gig/:gigId', authMiddleware.checkAuthentication, Get.prototype.gigById);
    this.router.get('/gig/seller/:sellerId', authMiddleware.checkAuthentication, Get.prototype.sellerByGigId);
    this.router.get('/gig/seller/pause/:sellerId', authMiddleware.checkAuthentication, Get.prototype.sellerInactiveGigs);
    this.router.get('/gig/category/:username', authMiddleware.checkAuthentication, Get.prototype.gigByCategory);
    this.router.get('/gig/top/:username', authMiddleware.checkAuthentication, Get.prototype.topRelatedGigs);
    this.router.get('/gig/search/:from/:size/:type', authMiddleware.checkAuthentication, Search.prototype.gigs);
    this.router.get('/gig/similar/:gigId', authMiddleware.checkAuthentication, Get.prototype.similarGigs);
    this.router.put('/gig/active/:gigId', authMiddleware.checkAuthentication, Update.prototype.updateActiveGig);
    this.router.put('/gig/:gigId', authMiddleware.checkAuthentication, Update.prototype.updateGig);
    this.router.post('/gig/create', authMiddleware.checkAuthentication, Create.prototype.createGig);
    this.router.delete('/gig/:gigId/:sellerId', authMiddleware.checkAuthentication, Delete.prototype.deleteGig);

    this.router.post('/gig/seed/:count', authMiddleware.checkAuthentication, GigSeed.prototype.seed);

    return this.router;
  }
}

export const gigRoute: GigRoute = new GigRoute();
