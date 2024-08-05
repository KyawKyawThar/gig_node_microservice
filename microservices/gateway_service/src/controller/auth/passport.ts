import { authService } from '@gateway/api/authService';
import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

class Password {
  public async forgetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const response = await authService.forgetPassword(email);

      res.status(StatusCodes.OK).json({ message: response.data.message });

      logger.info('Password reset email sent has been sent successfully');
    } catch (err) {
      next(err);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.params.token;

      const response = await authService.resetPassword(token, req.body);
      res.status(StatusCodes.OK).json({ message: response.data.message });

      logger.info('Password has been reset successfully');
    } catch (err) {
      next(err);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const response = await authService.changePassword(currentPassword, newPassword);

      res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });

      logger.info('User changed password successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const password = new Password();
