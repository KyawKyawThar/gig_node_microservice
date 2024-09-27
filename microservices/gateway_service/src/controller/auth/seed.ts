import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/logger';
import { authService } from '@gateway/services/api/authService';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

class CreateAuthSeed {
  public async seed(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await authService.seeds(req.params.count);
      res.status(StatusCodes.CREATED).json({ message: response.data.message });
      logger.info('seed have been created successfully...');
    } catch (error) {
      next(error);
    }
  }
}

export const createAuthSeed = new CreateAuthSeed();
