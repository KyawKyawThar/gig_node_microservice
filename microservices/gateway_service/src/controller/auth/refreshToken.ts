import { authService } from '@gateway/services/api/authService';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');
class Refresh {
  public async token(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username } = req.params;

      const response = await authService.getRefreshToken(username);

      res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });

      logger.info('Refresh token have been generated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const refresh = new Refresh();
