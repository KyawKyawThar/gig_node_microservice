import { markManyMessagesAsRead, markMessageAsRead, updateOffer } from '@chats/services/message.service';
import { NextFunction, Request, Response } from 'express';
import { winstonLogger } from '@chats/logger';
import { Logger } from 'winston';
import { config } from '@chats/config';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chat_service', 'debug');
export const offer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messageId, type } = req.body;

    const result = await updateOffer(messageId, type);

    res.status(StatusCodes.OK).json({ message: 'Offer updated successfully', offerUpdate: result });
    logger.info('chat_service offer updated successfully');
  } catch (error) {
    next(error);
  }
};
export const markMultipleMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messageId, senderUsername, receiverUsername } = req.body;

    console.log('mark-multiple-as-read called...');
    await markManyMessagesAsRead(messageId, senderUsername, receiverUsername);
    res.status(StatusCodes.OK).json({ message: 'Messages marked as read' });
    logger.info('chat_service  markMultipleMessages successfully.');
  } catch (error) {
    next(error);
  }
};
export const markSingleMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { messageId } = req.body;
    const message = await markMessageAsRead(messageId);
    res.status(StatusCodes.OK).json({ message: 'Message marked as read', singleMessage: message });
    logger.info('chat_service markSingleMessage successfully.');
  } catch (error) {
    next(error);
  }
};
