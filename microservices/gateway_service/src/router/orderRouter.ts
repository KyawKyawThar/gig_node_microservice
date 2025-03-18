import express, { Router } from 'express';
import { Get } from '@gateway/controller/order/get';
import { Create } from '@gateway/controller/order/create';
import { Update } from '@gateway/controller/order/update';

class OrderRoute {
  private readonly router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/order', Create.prototype.order);
    this.router.post('/order/create-payment-intent', Create.prototype.intent);

    this.router.get('/order/notification/:userTo', Get.prototype.getNotifications);
    this.router.get('/order/:orderId', Get.prototype.getOrderId);
    this.router.get('/order/seller/:sellerId', Get.prototype.sellerOrders);
    this.router.get('/order/buyer/:buyerId', Get.prototype.buyerOrders);

    this.router.put('/order/approve-order/:orderId', Update.prototype.approveOrder);
    this.router.put('/order/extension/:orderId', Update.prototype.requestExtension);
    this.router.put('/order/deliver-order/:orderId', Update.prototype.deliverOrder);
    this.router.put('/order/gig/:type/:orderId', Update.prototype.deliveryDate);

    this.router.put('/order/notification/mark-as-read', Update.prototype.markNotificationAsRead);

    this.router.put('/order/cancel/:orderId', Update.prototype.cancel);
    return this.router;
  }
}

export const orderRoute: OrderRoute = new OrderRoute();
