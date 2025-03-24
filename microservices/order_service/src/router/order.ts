import { Router } from 'express';
import { notification } from '@order/controller/notification/get';
import { markSingleNotificationAsRead } from '@order/controller/notification/update';
import { buyerId, orderId, sellerId } from '@order/controller/order/get';
import { intent, order } from '@order/controller/order/create';
import { buyerApproveOrder, cancel, deliverOrder, deliveryDate, requestExtension } from '@order/controller/order/update';

const router = Router();

export const orderRouter = (): Router => {
  router.post('/', order);
  router.post('/create-payment-intent', intent);

  router.get('/:orderId', orderId);
  router.get('/seller/:sellerId', sellerId);
  router.get('/buyer/:buyerId', buyerId);
  router.get('/notification/:userTo', notification);

  router.put('/cancel/:orderId', cancel);

  router.put('/extension/:orderId', requestExtension);
  router.put('/approve-order/:orderId', buyerApproveOrder);

  router.put('/gig/:type/:orderId', deliveryDate);
  router.put('/deliver-order/:orderId', deliverOrder);

  router.put('/notification/mark-as-read', markSingleNotificationAsRead);

  return router;
};
