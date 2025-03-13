import { Router } from 'express';
import { notification } from '@order/controller/notification/get';
import { markSingleNotificationAsRead } from '@order/controller/notification/update';
import { buyerId, orderId, sellerId } from '@order/controller/order/get';
import { intent, order } from '@order/controller/order/create';
import { buyerApproveOrder, cancel, deliverOrder, deliveryDate, requestExtension } from '@order/controller/order/update';

const router = Router();

export const orderRouter = (): Router => {
  router.get('/:orderId', orderId);
  router.get('/seller/:sellerId', sellerId);
  router.get('/buyer/:buyerId', buyerId);
  router.post('/create-payment-intent', intent);
  router.post('/', order);
  router.put('/cancel/:orderId', cancel);
  router.put('/extension/:orderId', requestExtension);
  router.put('/gig/:type/:orderId', deliveryDate);
  router.put('/deliver-order/:orderId', deliverOrder);
  router.put('/approve-order/:orderId', buyerApproveOrder);
  router.put('/notification/mark-as-read', markSingleNotificationAsRead);
  router.get('/notification/:userTo', notification);
  return router;
};
