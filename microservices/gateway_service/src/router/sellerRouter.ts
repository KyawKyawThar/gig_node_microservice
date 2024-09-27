import express, { Router } from 'express';
import { authMiddleware } from '@gateway/services/auth-middleware';
import { Create } from '@gateway/controller/users/seller/create';
import { Get } from '@gateway/controller/users/seller/get';
import { Update } from '@gateway/controller/users/seller/update';
import { Seller } from '@gateway/controller/users/seller/seed';

class SellerRoute {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/seller/create', authMiddleware.checkAuthentication, Create.prototype.Seller);
    this.router.get('/seller/id/:sellerId', authMiddleware.checkAuthentication, Get.prototype.sellerById);
    this.router.get('/seller/username/:username', authMiddleware.checkAuthentication, Get.prototype.sellerByUsername);
    this.router.get('/seller/random/:size', authMiddleware.checkAuthentication, Get.prototype.getRandomSeller);
    this.router.put('/seller/:sellerId', authMiddleware.checkAuthentication, Update.prototype.updateSeller);
    this.router.post('/seller/seed/:count', authMiddleware.checkAuthentication, Seller.prototype.seed);
    return this.router;
  }
}

export const sellerRoute: SellerRoute = new SellerRoute();
