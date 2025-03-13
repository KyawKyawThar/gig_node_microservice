import { conversationModel } from '@chats/models/conversation.schema';
import { messageModel } from '@chats/models/message.schema';
import { publicDirectMessage } from '@chats/queue/chat.producer';
import { chatChannel, socketIOChatObject } from '@chats/server';
import { IConversationDocument, IMessageDocument } from '@chats/types/chatTypes';
import { IMessageDetails } from '@chats/types/chatTypes';

export const createConversation = async (conversationId: string, sender: string, receiver: string): Promise<IConversationDocument> => {
  const create = await conversationModel.create({
    conversationId,
    senderUsername: sender,
    receiverUsername: receiver
  });
  return create;
};

export const addMessage = async (message: IMessageDocument): Promise<IMessageDocument> => {
  const create = (await messageModel.create(message)) as IMessageDocument;

  console.log('addMessage...', create);
  const emailMessageDetail: IMessageDetails = {
    sender: message.senderUsername,
    amount: message.offer?.price,
    buyerUsername: message.receiverUsername?.toLowerCase(),
    sellerUsername: message.senderUsername?.toLowerCase(),
    title: message.offer?.gigTitle,
    description: message.offer?.description,
    deliveryDays: `${message.offer?.deliveryInDays}`,
    template: 'offer'
  };

  if (message.hasOffer) {
    await publicDirectMessage(
      chatChannel,
      'order-notification',
      'order-key',
      JSON.stringify(emailMessageDetail),
      'Order email sent to notification service.'
    );
  }

  socketIOChatObject.emit('message received', create);
  return create;
};

export const getConversation = async (sender: string, receiver: string): Promise<IConversationDocument[]> => {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: receiver },
      { senderUsername: receiver, receiverUsername: sender }
    ]
  };

  const conversations = (await conversationModel.aggregate([{ $match: query }])) as IConversationDocument[];

  return conversations;
};

export const getUserConversationList = async (username: string): Promise<IMessageDocument[]> => {
  const query = {
    $or: [
      { senderUsername: username }, // Match documents where senderUsername is 'Manny'
      { receiverUsername: username } // Match documents where receiverUsername is 'Manny'
    ]
  };

  const conversationLists: IMessageDocument[] = await messageModel.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$conversationId',
        result: {
          $top: {
            output: '$$ROOT',
            sortBy: { createdAt: -1 }
          }
        }
      }
    },
    {
      $project: {
        _id: '$result._id',
        conversationId: '$result.conversationId',
        sellerId: '$result.sellerId',
        buyerId: '$result.buyerId',
        receiverUsername: '$result.receiverUsername',
        receiverPicture: '$result.receiverPicture',
        senderUsername: '$result.senderUsername',
        senderPicture: '$result.senderPicture',
        body: '$result.body',
        file: '$result.file',
        gigId: '$result.gigId',
        isRead: '$result.isRead',
        hasOffer: '$result.hasOffer',
        createdAt: '$result.createdAt'
      }
    }
  ]);

  return conversationLists;
};

export const getMessages = async (sender: string, receiver: string): Promise<IMessageDocument[]> => {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: receiver },
      { senderUsername: receiver, receiverUsername: sender }
    ]
  };
  const getMessage: IMessageDocument[] = await messageModel.aggregate([{ $match: query }, { $sort: { createdAt: 1 } }]);

  return getMessage;
};

export const getUserMessages = async (conversationId: string): Promise<IMessageDocument[]> => {
  const getMessages: IMessageDocument[] = await messageModel.aggregate([{ $match: { conversationId } }, { $sort: { createdAt: 1 } }]);
  return getMessages;
};

export const updateOffer = async (messageId: string, type: string): Promise<IMessageDocument> => {
  const result = (await messageModel.findOneAndUpdate(
    {
      _id: messageId
    },
    {
      $set: {
        [`offer.${type}`]: true
      }
    },
    { new: true }
  )) as IMessageDocument;

  return result;
};

export const markMessageAsRead = async (messageId: string): Promise<IMessageDocument> => {
  const readMessage = (await messageModel.findByIdAndUpdate(
    {
      _id: messageId
    },
    {
      $set: {
        isRead: true
      }
    },
    { new: true }
  )) as IMessageDocument;

  socketIOChatObject.emit('update message', readMessage);

  return readMessage;
};

export const markManyMessagesAsRead = async (messageId: string, sender: string, receiver: string): Promise<IMessageDocument> => {
  await messageModel.updateMany(
    {
      _id: messageId,
      senderUsername: sender,
      receiverUsername: receiver,
      isRead: false
    },
    {
      $set: {
        isRead: true
      }
    }
  );

  const result = (await messageModel.findOne({ _id: messageId })) as IMessageDocument;

  socketIOChatObject.emit('update message', result);
  return result;
};
