import { randomInt } from 'crypto';
import { BadRequestError, ForbiddenError, NotAuthorizedError, NotFoundError, ServerError } from '@auth/errorHandler';
import { AuthModel } from '@auth/models/auth.schema';
import { publicDirectMessage } from '@auth/queues/auth.producer';
import { signInSchema } from '@auth/schemes/signin';
import { authChannel } from '@auth/server';
import { getUserByEmail, getUserByUsername, signToken, updateUserOTP } from '@auth/services/auth.service';
import { IAuthDocument, IEmailMessageDetails } from '@auth/types/authTypes';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';
import { DatabaseError } from 'sequelize';
import { config } from '@auth/config';
import { winstonLogger } from '@auth/logger';
import { Logger } from 'winston';
import { NextFunction, Request, Response } from 'express';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');

export function isGmail(email: string): boolean {
  const regexExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/gi;
  return regexExp.test(email);
}

export async function signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, browserName, deviceType } = req.body;

    //console.log('Reach in SignIn', req.body);
    // logger.info(req.body);
    const isValid = isGmail(email);

    if (!isValid) {
      throw new ForbiddenError('Email is not valid', 'auth-service signIn method() error');
    }

    const { error } = signInSchema.validate(req.body);

    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'auth-service signIn create() method error');
    }

    const result = isValid ? await getUserByEmail(email) : await getUserByUsername(email);

    if (!result) {
      throw new NotFoundError('user does not exist', 'auth-service signIn method() error');
    }

    if (result instanceof DatabaseError) {
      logger.error(`SQL Error Message: ${result.original.message}`);
      throw new ServerError(result.original.message, 'auth-service Sign In method() error');
    }
    const existingUser = result as IAuthDocument;

    if (!existingUser.emailVerified) {
      throw new ForbiddenError('Email not verified. Please verify your email to continue.', 'auth-service signIn method() error');
    }

    if (existingUser.password) {
      const isMatchPassword: boolean = await AuthModel.prototype.comparePassword(password, existingUser.password!);
      if (!isMatchPassword) {
        throw new NotAuthorizedError('Username or Passwords do not match', 'auth-service signIn method() error');
      }
    }

    let userJWT: string = '';
    //let refreshToken: string = '';
    let userData: IAuthDocument | null = null;
    let message: string = 'User login successfully';
    let userBrowserName: string = '';
    let userDeviceType: string = '';

    if (browserName.toLowerCase() !== existingUser.browserName || deviceType.toLowerCase() !== existingUser.deviceType) {
      // min 6 digits and max 6 digits
      // 100000 - 999999
      const otpCode = randomInt(10 ** 5, 10 ** 6 - 1);
      const OTPMessageDetail: IEmailMessageDetails = {
        username: existingUser.username,
        receiverEmail: existingUser.email,
        otp: `${otpCode}`,
        template: 'otpEmail'
      };

      await publicDirectMessage(
        authChannel,
        config.EMAIL_EXCHANGE_NAME,
        config.EMAIL_ROUTING_KEY,
        JSON.stringify(OTPMessageDetail),
        'OTP email message sent to notification service.'
      );
      message = 'OTP code sent';
      const otpExpirationDate = new Date();
      otpExpirationDate.setMinutes(otpExpirationDate.getMinutes() + 10);
      userBrowserName = existingUser.browserName!;
      userDeviceType = existingUser.deviceType!;
      await updateUserOTP(existingUser.id!, `${otpCode}`, otpExpirationDate, '', '');
    } else {
      userJWT = signToken(existingUser.id!, existingUser.username!, existingUser.email!);
      // refreshToken = userRefreshToken(result.id!, result.username!, result.email!);
      userData = omit(existingUser, ['password']);
    }

    res.status(StatusCodes.OK).json({
      message,
      user: userData,
      token: userJWT,
      browserName: userBrowserName,
      deviceType: userDeviceType
      // refreshToken
    });
    logger.info('User signed in successfully..');
  } catch (err) {
    next(err);
  }
}
