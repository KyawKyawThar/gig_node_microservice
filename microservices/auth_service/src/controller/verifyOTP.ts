import { config } from '@auth/config';
import { ServerError, BadRequestError } from '@auth/errorHandler';
import { winstonLogger } from '@auth/logger';
import { getUserByEmail, getUserByOTP, signToken, updateUserOTP } from '@auth/services/auth.service';
import { IAuthDocument } from '@auth/types/authTypes';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';
import { DatabaseError } from 'sequelize';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');

export async function verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { otp } = req.params;

    logger.info(`Verifying otp is ${otp}`);
    const { browserName, deviceType } = req.body;

    const result = await getUserByOTP(otp);

    if (result instanceof DatabaseError) {
      logger.error('SQL Error Message:', result.original.message);
      throw new ServerError(result.original.message, 'auth-service verifyOTP method() error');
    }

    const user = result as IAuthDocument;

    if (!user) {
      throw new BadRequestError('OTP is either invalid or expired.', 'auth-service verifyOTP method() error');
    }
    await updateUserOTP(user.id!, '', new Date(), browserName, deviceType);

    const otpUpdateUser = await getUserByEmail(user.email!);

    if (otpUpdateUser instanceof DatabaseError) {
      logger.error('SQL Error Message:', otpUpdateUser.original.message);
      throw new ServerError(otpUpdateUser.original.message, 'auth-service verifyOTP method() error');
    }

    const updateOTPUser = omit(otpUpdateUser, ['password']);
    const userJWT = signToken(user.id!, user.username!, user.email!);
    res.status(StatusCodes.OK).json({ message: 'OTP verified successfully.', user: updateOTPUser, token: userJWT });
  } catch (err) {
    next(err);
  }
}
