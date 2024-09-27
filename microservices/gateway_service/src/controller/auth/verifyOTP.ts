import { authService } from '@gateway/services/api/authService';
import { NextFunction, Request, Response } from 'express';
import { winstonLogger } from '@gateway/logger';
import { Logger } from 'winston';
import { config } from '@gateway/config';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');
class VerifyOTP {
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await authService.verifyOTP(req.params.otp, req.body);

      res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user, token: response.data.token });
      logger.info('OTP verified successfully');
    } catch (e) {
      next(e);
    }
  }
}

export const verifyOTP = new VerifyOTP();
