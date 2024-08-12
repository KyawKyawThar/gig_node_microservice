import express, { Router } from 'express';
import { search } from '@gateway/controller/auth/search';

class SearchRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/auth/search/gig/:gigId', search.gigByID);
    this.router.get('/auth/search/gigs/:from/:size/:type', search.gigs);
    return this.router;
  }
}

export const searchRoute: SearchRoute = new SearchRoute();
