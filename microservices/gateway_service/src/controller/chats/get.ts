import { NextFunction, Request, Response } from 'express';
import { winstonLogger } from '@gateway/logger';
import { Logger } from 'winston';
import { config } from '@gateway/config';
import { StatusCodes } from 'http-status-codes';
import { chatService } from '@gateway/services/api/chatService';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chat_service', 'debug');

export class Get {
  public async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { senderUsername, receiverUsername } = req.params;
      const response = await chatService.getConversation(senderUsername, receiverUsername);
      res.status(StatusCodes.OK).json({ message: response.data.messages, conversation: response.data.result });
      logger.info(response.data.message);
    } catch (error) {
      next(error);
    }
  }

  public async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { senderUsername, receiverUsername } = req.params;
      const response = await chatService.getMessages(senderUsername, receiverUsername);
      res.status(StatusCodes.OK).json({ message: response.data.message, data: response.data.messages });
      logger.info(response.data.messages);
    } catch (error) {
      next(error);
    }
  }
  public async getConversationList(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const response = await chatService.getConversationList(username);
      res.status(StatusCodes.OK).json({ message: response.data.message, conversationList: response.data.conversationList });
    } catch (error) {
      next(error);
    }
  }
  public async getUserMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const response = await chatService.getUserMessages(conversationId);
      res.status(StatusCodes.OK).json({ message: response.data.message, userMessages: response.data.userMessages });
      logger.info(response.data.message);
    } catch (error) {
      next(error);
    }
  }
}
