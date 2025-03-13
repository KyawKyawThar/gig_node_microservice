import { getConversation, getMessages, getUserConversationList, getUserMessages } from '@chats/services/message.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { winstonLogger } from '@chats/logger';
import { Logger } from 'winston';
import { config } from '@chats/config';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chat_service', 'debug');

export const conversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { senderUsername, receiverUsername } = req.params;
    const result = await getConversation(senderUsername, receiverUsername);
    res.status(StatusCodes.OK).json({ messages: 'Chat conversation', conversation: result });

    logger.info('chat_service get conversation successfully');
  } catch (error) {
    next(error);
  }
};
export const messages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { senderUsername, receiverUsername } = req.params;
    const result = await getMessages(senderUsername, receiverUsername);
    res.status(StatusCodes.OK).json({ message: 'Chat messages', messages: result });
    logger.info('chat_service get messages successfully');
  } catch (error) {
    next(error);
  }
};
export const conversationList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;
    console.log('conversationList', username);
    const result = await getUserConversationList(username);
    res.status(StatusCodes.OK).json({ message: 'get conversation list', conversationList: result });
    logger.info('chat_service get conversationList successfully');
  } catch (error) {
    next(error);
  }
};
export const userMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const result = await getUserMessages(conversationId);
    res.status(StatusCodes.OK).json({ message: 'get userMessage', userMessages: result });
    logger.info('chat_service get user messages successfully');
  } catch (error) {
    next(error);
  }
};
