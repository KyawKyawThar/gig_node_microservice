import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { chatService } from '@gateway/services/api/chatService';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class Create {
  public async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await chatService.createMessage(req.body);
      res
        .status(StatusCodes.OK)
        .json({ message: response.data.message, conversationId: response.data.conversationId, messageData: response.data.result });
      logger.info(response.data.message);
    } catch (error) {
      next(error);
    }
  }
}
