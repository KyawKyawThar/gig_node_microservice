import { config } from '@order/config';
import { orderModel } from '@order/models/order.schema';
import { publicDirectMessage } from '@order/queue/order.producer';
import { orderChannel } from '@order/server';
import { IDeliveredWork, IExtendedDelivery, IOrderDocument, IOrderMessage, IReviewMessageDetails } from '@order/types/orderTypes';
import { lowerCase, toLower } from 'lodash';
import { sendNotification } from './notification.service';

export const getOrderByOrderId = async (orderId: string): Promise<IOrderDocument> => {
  const getOrder = (await orderModel.findOne({ orderId })) as IOrderDocument;

  return getOrder;
};

export const getOrderBySellerId = async (sellerId: string): Promise<IOrderDocument> => {
  const getOrderBySeller = (await orderModel.findOne({ sellerId })) as IOrderDocument;
  return getOrderBySeller;
};

export const getOrdersByBuyerId = async (buyerId: string): Promise<IOrderDocument> => {
  const getOrderByBuyer = (await orderModel.findOne({ buyerId })) as IOrderDocument;

  return getOrderByBuyer;
};

export const createOrder = async (data: IOrderDocument): Promise<IOrderDocument> => {
  const createOrder = (await orderModel.create(data)) as IOrderDocument;

  const messageDetail: IOrderMessage = {
    sellerId: createOrder.sellerId,
    ongoingJobs: 1,
    type: 'create-order'
  };
  const exchangeName = 'user-buyer-update';
  const routingKey = 'user-buyer';

  // update seller info
  await publicDirectMessage(orderChannel, exchangeName, routingKey, JSON.stringify(messageDetail), 'Details sent to users service');
  const emailMessageDetail: IOrderMessage = {
    orderId: createOrder.orderId,
    invoiceId: createOrder.invoiceId,
    orderDue: `Date.${createOrder.offer.newDeliveryDate}`,
    amount: `${createOrder.price}`,
    buyerUsername: toLower(`${createOrder.buyerUsername}`),
    sellerUsername: toLower(`${createOrder.sellerUsername}`),
    title: createOrder.offer.gigTitle,
    requirements: createOrder.requirements,
    serviceFee: `${createOrder.serviceFee}`,
    total: `${createOrder.price + createOrder.serviceFee!}`,
    orderUrl: `${config.CLIENT_URL}/orders/${createOrder.orderId}/activities`,
    template: 'orderPlaced'
  };

  await publicDirectMessage(
    orderChannel,
    'order-notification',
    'order-key',
    JSON.stringify(emailMessageDetail),
    'Order email sent to notification service'
  );

  sendNotification(createOrder.sellerUsername, createOrder, 'placed an order for your gig.');
  return createOrder;
};

export const cancelOrder = async (orderId: string, data: IOrderMessage): Promise<IOrderDocument> => {
  const cancel = (await orderModel.findOneAndUpdate(
    {
      orderId
    },
    {
      $set: {
        cancelled: true,
        status: 'cancelled',
        approvedAt: new Date()
      }
    },
    { new: true }
  )) as IOrderDocument;

  await publicDirectMessage(
    orderChannel,
    'user-seller-update',
    'user-buyer',
    JSON.stringify({ type: 'cancel-order', sellerId: cancel.sellerId }),
    'Cancelled order details sent to users service.'
  );

  await publicDirectMessage(
    orderChannel,
    'user-buyer-update',
    'user-buyer',
    JSON.stringify({ type: 'cancel-order', buyerId: cancel.buyerId, purchasedGigs: data.purchasedGigs }),
    'Cancelled order details sent to users service.'
  );

  sendNotification(cancel.sellerUsername, cancel, 'cancelled your order delivery.');
  return cancel;
};

export const approveOrder = async (orderId: string, data: IOrderMessage): Promise<IOrderDocument> => {
  const approve = (await orderModel.findOneAndUpdate(
    { orderId },
    {
      $set: {
        approved: true,
        status: 'approved',
        approvedAt: new Date()
      }
    }
  )) as IOrderDocument;

  const messageDetails: IOrderMessage = {
    sellerId: data.sellerId,
    buyerId: data.buyerId,
    ongoingJobs: data.ongoingJobs,
    completedJobs: data.completedJobs,
    totalEarnings: data.totalEarnings, // this is the price the seller earned for lastest order delivered
    recentDelivery: `${new Date()}`,
    type: 'approve-order'
  };
  publicDirectMessage(
    orderChannel,
    'user-seller-update',
    'user-seller',
    JSON.stringify(messageDetails),
    'Approved order details sent to users service.'
  );

  publicDirectMessage(
    orderChannel,
    'user-buyer-update',
    'user-buyer',
    JSON.stringify({ type: 'purchased-gigs', buyerId: data.buyerId, purchasedGigs: data.purchasedGigs }),
    'Approved order details sent to users service.'
  );

  sendNotification(approve.buyerUsername, approve, 'approved your order delivery.');
  return approve;
};

export const sellerDeliverOrder = async (orderId: string, delivered: boolean, deliveredWork: IDeliveredWork): Promise<IOrderDocument> => {
  const order: IOrderDocument = (await orderModel
    .findOneAndUpdate(
      { orderId },
      {
        $set: {
          delivered,
          status: 'Delivered',
          ['events.orderDelivered']: new Date()
        },
        $push: {
          deliveredWork
        }
      },
      { new: true }
    )
    .exec()) as IOrderDocument;
  if (order) {
    const messageDetails: IOrderMessage = {
      orderId,
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      title: order.offer.gigTitle,
      description: order.offer.description,
      orderUrl: `${config.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderDelivered'
    };
    // send email
    await publicDirectMessage(
      orderChannel,
      'order-notification',
      'order-key',
      JSON.stringify(messageDetails),
      'Order delivered message sent to notification service.'
    );
    sendNotification(order.buyerUsername, order, 'delivered your order.');
  }
  return order;
};

export const requestDeliveryExtension = async (orderId: string, data: IExtendedDelivery): Promise<IOrderDocument> => {
  const { newDate, days, reason, originalDate } = data;
  const order: IOrderDocument = (await orderModel
    .findOneAndUpdate(
      { orderId },
      {
        $set: {
          ['requestExtension.originalDate']: originalDate,
          ['requestExtension.newDate']: newDate,
          ['requestExtension.days']: days,
          ['requestExtension.reason']: reason
        }
      },
      { new: true }
    )
    .exec()) as IOrderDocument;
  if (order) {
    const messageDetails: IOrderMessage = {
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      originalDate: order.offer.oldDeliveryDate,
      newDate: order.offer.newDeliveryDate,
      reason: order.offer.reason,
      orderUrl: `${config.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderExtension'
    };
    // send email
    await publicDirectMessage(
      orderChannel,
      'order-notification',
      'order-key',
      JSON.stringify(messageDetails),
      'Order delivered message sent to notification service.'
    );
    sendNotification(order.buyerUsername, order, 'requested for an order delivery date extension.');
  }
  return order;
};

export const approveDeliveryDate = async (orderId: string, data: IExtendedDelivery): Promise<IOrderDocument> => {
  const { newDate, days, reason, deliveryDateUpdate } = data;
  const order: IOrderDocument = (await orderModel
    .findOneAndUpdate(
      { orderId },
      {
        $set: {
          ['offer.deliveryInDays']: days,
          ['offer.newDeliveryDate']: newDate,
          ['offer.reason']: reason,
          ['events.deliveryDateUpdate']: new Date(`${deliveryDateUpdate}`),
          requestExtension: {
            originalDate: '',
            newDate: '',
            days: 0,
            reason: ''
          }
        }
      },
      { new: true }
    )
    .exec()) as IOrderDocument;
  if (order) {
    const messageDetails: IOrderMessage = {
      subject: 'Congratulations: Your extension request was approved',
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      header: 'Request Accepted',
      type: 'accepted',
      message: 'You can continue working on the order.',
      orderUrl: `${config.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderExtensionApproval'
    };
    // send email
    await publicDirectMessage(
      orderChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order request extension approval message sent to notification service.'
    );
    sendNotification(order.sellerUsername, order, 'approved your order delivery date extension request.');
  }
  return order;
};

export const rejectDeliveryDate = async (orderId: string): Promise<IOrderDocument> => {
  const order: IOrderDocument = (await orderModel
    .findOneAndUpdate(
      { orderId },
      {
        $set: {
          requestExtension: {
            originalDate: '',
            newDate: '',
            days: 0,
            reason: ''
          }
        }
      },
      { new: true }
    )
    .exec()) as IOrderDocument;
  if (order) {
    const messageDetails: IOrderMessage = {
      subject: 'Sorry: Your extension request was rejected',
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      header: 'Request Rejected',
      type: 'rejected',
      message: 'You can contact the buyer for more information.',
      orderUrl: `${config.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderExtensionApproval'
    };
    // send email
    await publicDirectMessage(
      orderChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order request extension rejection message sent to notification service.'
    );
    sendNotification(order.sellerUsername, order, 'rejected your order delivery date extension request.');
  }
  return order;
};

export const updateOrderReview = async (data: IReviewMessageDetails): Promise<IOrderDocument> => {
  const order: IOrderDocument = (await orderModel
    .findOneAndUpdate(
      { orderId: data.orderId },
      {
        $set:
          data.type === 'buyer-review'
            ? {
                buyerReview: {
                  rating: data.rating,
                  review: data.review,
                  created: new Date(`${data.createdAt}`)
                },
                ['events.buyerReview']: new Date(`${data.createdAt}`)
              }
            : {
                sellerReview: {
                  rating: data.rating,
                  review: data.review,
                  created: new Date(`${data.createdAt}`)
                },
                ['events.sellerReview']: new Date(`${data.createdAt}`)
              }
      },
      { new: true }
    )
    .exec()) as IOrderDocument;
  sendNotification(
    data.type === 'buyer-review' ? order.sellerUsername : order.buyerUsername,
    order,
    `left you a ${data.rating} star review`
  );
  return order;
};
