import { randomInt } from 'crypto';

import { config } from '@auth/config';
import { BadRequestError, NotAuthorizedError, ServerError } from '@auth/errorHandler';
import { AuthModel } from '@auth/models/auth.schema';
//import { publicDirectMessage } from '@auth/queues/auth.producer';
import { signInSchema } from '@auth/schemes/signin';
// import { authChannel } from '@auth/server';
import { getUserByEmail, getUserByUsername, signToken, updateUserOTP } from '@auth/services/auth.service';
import { IAuthDocument } from '@auth/types/authTypes';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';
import { winstonLogger } from '@auth/logger';
import { DatabaseError } from 'sequelize';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');
export function isEmail(email: string): boolean {
  const regexExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
  return regexExp.test(email);
}

export async function signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = signInSchema.validate(req.body);

    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'auth-service signIn create() method error');
    }

    const { username, password, browserName, deviceType } = req.body;

    const isValid = isEmail(username);

    const result = isValid ? await getUserByEmail(username) : await getUserByUsername(username);

    if (result instanceof DatabaseError) {
      logger.error('SQL Error Message:', result.original.message);
      throw new ServerError(result.original.message, 'auth-service verifyOTP method() error');
    }
    const existingUser = result as IAuthDocument;

    if (!existingUser) {
      throw new BadRequestError('user does not exist', 'auth-service signIn method() error');
    }
    if (existingUser.password) {
      const isMatchPassword: boolean = await AuthModel.prototype.comparePassword(password, existingUser.password!);
      if (!isMatchPassword) {
        throw new NotAuthorizedError('Username or Passwords do not match', 'auth-service signIn method() error');
      }
    }
    let userJWT: string = '';
    let userData: IAuthDocument | null = null;
    let message: string = 'User login successfully';
    let userBrowserName: string = '';
    let userDeviceType: string = '';

    if (browserName !== existingUser.browserName || deviceType !== existingUser.deviceType) {
      // min 6 digits and max 6 digits
      // 100000 - 999999
      const otpCode = randomInt(10 ** 5, 10 ** 6 - 1);
      // const OTPMessageDetail: IEmailMessageDetails = {
      //   username: existingUser.username,
      //   receiverEmail: existingUser.email,
      //   otp: `${otpCode}`,
      //   template: 'otpEmail'
      // };

      // await publicDirectMessage(
      //   authChannel,
      //   config.EMAIL_EXCHANGE_NAME,
      //   config.EMAIL_ROUTING_KEY,
      //   JSON.stringify(OTPMessageDetail),
      //   'OTP email message sent to notification service.'
      // );
      message = 'OTP code sent';
      const otpExpirationDate = new Date();
      otpExpirationDate.setMinutes(otpExpirationDate.getMinutes() + 10);
      userBrowserName = existingUser.browserName!;
      userDeviceType = existingUser.deviceType!;
      await updateUserOTP(existingUser.id!, `${otpCode}`, otpExpirationDate, '', '');
    } else {
      userJWT = signToken(existingUser.id!, existingUser.username!, existingUser.email!);
      userData = omit(existingUser, ['password']);
    }

    res.status(StatusCodes.OK).json({ message, user: userData, token: userJWT, browserName: userBrowserName, deviceType: userDeviceType });
    logger.info('User signed in successfully..');
  } catch (err) {
    next(err);
  }
}
