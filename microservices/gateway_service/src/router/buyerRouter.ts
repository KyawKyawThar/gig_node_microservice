import express, { Router } from 'express';
import { authMiddleware } from '@gateway/services/auth-middleware';
import { Get } from '@gateway/controller/users/buyer/get';

class BuyerRoute {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/buyer/email', authMiddleware.checkAuthentication, Get.prototype.email);
    this.router.get('/buyer/username', authMiddleware.checkAuthentication, Get.prototype.currentUser);
    this.router.get('/buyer/:username', authMiddleware.checkAuthentication, Get.prototype.username);
    return this.router;
  }
}

export const buyerRoute: BuyerRoute = new BuyerRoute();
