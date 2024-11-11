import { IOrderNotification } from '@order/types/orderTypes';
import { Model, model, Schema } from 'mongoose';

const notificationSchema: Schema = new Schema({
  userToId: { type: String, default: '', index: true },
  senderUsername: { type: String, default: '' },
  senderPicture: { type: String, default: '' },
  receiverUsername: { type: String, default: '' },
  receiverPicture: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  message: { type: String, default: '' },
  orderId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const notificationModel: Model<IOrderNotification> = model<IOrderNotification>('OrderNotificationModel', notificationSchema);
