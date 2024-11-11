import { notificationModel } from '@order/models/notification.schema';
import { orderModel } from '@order/models/order.schema';
import { socketIOChatObject } from '@order/server';
import { IOrderDocument, IOrderNotification } from '@order/types/orderTypes';

export const createNotification = async (data: IOrderNotification): Promise<IOrderNotification> => {
  const result: IOrderNotification = await notificationModel.create(data);
  return result;
};
export const getNotificationsById = async (userToId: string): Promise<IOrderNotification[]> => {
  const result = await notificationModel.aggregate([{ $match: { userToId } }]);
  return result;
};
export const markNotificationAsRead = async (notificationId: string): Promise<IOrderNotification> => {
  const notification = (await notificationModel.findByIdAndUpdate(
    { _id: notificationId },

    { $set: { isRead: true } },
    { new: true }
  )) as IOrderNotification;

  const orderNotification = await orderModel.findById({ orderId: notification.orderId });

  socketIOChatObject.emit('order notification', orderNotification, notification);
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
  socketIOChatObject.emit('order notification', data, orderNotification);
};
