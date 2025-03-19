import { authService } from '@gateway/services/api/authService';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');
class Refresh {
  public async token(req: Request, res: Response, next: NextFunction): Promise<void> {
    //user: token, refreshToken: refreshToken
    try {
      console.log('gateway service refreshToken', req.cookies);

      const response = await authService.getRefreshToken();

      // res.cookie('refreshToken', response.data.refreshToken, {
      //   httpOnly: true,
      //   //  secure: config.NODE_ENV !== 'development',
      //   sameSite: 'strict',
      //   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      // });

      req.session = { jwt: response.data.refreshToken };
      res.status(StatusCodes.OK).json({ message: response.data.message, accessToken: response.data.accessToken });

      logger.info('Refresh token have been generated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const refresh = new Refresh();
