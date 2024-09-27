import { authService } from '@gateway/services/api/authService';
import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

class VerifyEmail {
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      const response = await authService.verifyEmail(token);
      res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });

      logger.info('Verified email has been updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const verifyEmail = new VerifyEmail();
