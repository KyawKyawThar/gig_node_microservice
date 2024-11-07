import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { chatService } from '@gateway/services/api/chatService';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');
export class Update {
  public async updateOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await chatService.updateOffer(req.body);
      res.status(StatusCodes.OK).json({ message: response.data.message, singleMessage: response.data.result });
      logger.info(response.data.message);
    } catch (error) {
      next(error);
    }
  }

  public async markMultipleMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { messageId, senderUsername, receiverUsername } = req.body;
      const response = await chatService.markMultipleMessages(messageId, senderUsername, receiverUsername);
      res.status(StatusCodes.OK).json({ message: response.data.message });
      logger.info(response.data.message);
    } catch (error) {
      next(error);
    }
  }

  public async markSingleMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { messageId } = req.body;
      const response = await chatService.markSingleMessage(messageId);
      res.status(StatusCodes.OK).json({ message: response.data.message, singleMessage: response.data.singleMessage });
      logger.info(response.data.message);
    } catch (error) {
      next(error);
    }
  }
}
