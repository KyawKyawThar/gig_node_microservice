import { notificationModel } from '@order/models/notification.schema';
import { orderModel } from '@order/models/order.schema';

import { IOrderDocument, IOrderNotification } from '@order/types/orderTypes';
import { socketIOOrderObject } from '@order/server';

export const createNotification = async (data: IOrderNotification): Promise<IOrderNotification> => {
  return await notificationModel.create(data);
};
export const getNotificationsById = async (userToId: string): Promise<IOrderNotification[]> => {
  //console.log('userToId', userToId);

  return notificationModel.aggregate([{ $match: { userToId } }]);
};

export const markNotificationAsRead = async (notificationId: string): Promise<IOrderNotification> => {
  const notification = (await notificationModel.findByIdAndUpdate(
    { _id: notificationId },

    { $set: { isRead: true } },
    { new: true }
  )) as IOrderNotification;

  const orderNotification = await orderModel.findOne({ orderId: notification.orderId });

  socketIOOrderObject.emit('order notification', orderNotification, notification);
  return notification;
};

export const sendNotification = async (userId: string, data: IOrderDocument, message: string): Promise<void> => {
  const notification: IOrderNotification = {
    userToId: userId,
    senderUsername: data.sellerUsername,
    senderPicture: data.sellerImage,
    receiverUsername: data.buyerUsername,
    receiverPicture: data.buyerImage,
    message,
    orderId: data.orderId
  };

  const orderNotification = await createNotification(notification);
  socketIOOrderObject.emit('order notification', orderNotification, data);
};
