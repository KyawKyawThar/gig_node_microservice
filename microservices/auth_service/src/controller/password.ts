import crypto from 'crypto';

import { config } from '@auth/config';
import { BadRequestError, NotFoundError, ServerError } from '@auth/errorHandler';
import { winstonLogger } from '@auth/logger';
import { changePasswordSchema, emailSchema, passwordSchema } from '@auth/schemes/password';
import { getUserByEmail, getUserByPasswordToken, updatePassword, updatePasswordToken } from '@auth/services/auth.service';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { publicDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { IAuthDocument, IEmailMessageDetails } from '@auth/types/authTypes';
import { StatusCodes } from 'http-status-codes';
import { AuthModel } from '@auth/models/auth.schema';
import { DatabaseError } from 'sequelize';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');

export async function forgetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = emailSchema.validate(req.body);
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'auth-service forgetPassword() method error');
    }

    const result = await getUserByEmail(req.body.email);

    if (result instanceof DatabaseError) {
      logger.error('SQL Error Message:', result.original.message);
      throw new ServerError(result.original.message, 'auth-service forgetPassword method() error');
    }

    const user = result as IAuthDocument;
    if (!user) {
      throw new NotFoundError('User does not exist', 'auth-service forgetPassword() method error');
    }

    const tokenExpiredDate = new Date();
    tokenExpiredDate.setHours(tokenExpiredDate.getHours() + 1);
    const randomByte = crypto.randomBytes(20);
    const randomCharacter = randomByte.toString('hex');

    const resetLink = `${config.CLIENT_URL}/reset_password?v_token=${randomCharacter}`;

    const messageDetail: IEmailMessageDetails = {
      receiverEmail: user.email,
      resetLink,
      username: user.username,
      template: 'forgotPassword'
    };

    await publicDirectMessage(
      authChannel,
      config.EMAIL_EXCHANGE_NAME,
      config.EMAIL_ROUTING_KEY,
      JSON.stringify(messageDetail),
      'Forgot password message sent to notification service.'
    );

    await updatePasswordToken(user.id!, randomCharacter, tokenExpiredDate);
    res.status(StatusCodes.OK).json({ message: 'Password reset email sent.' });
    logger.info('Password reset email sent.');
  } catch (err) {
    next(err);
  }
}

//need to improve and check password reset expired
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = passwordSchema.validate(req.body);

    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'auth-service resetPassword() method error');
    }

    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match', 'Password resetPassword() method error');
    }

    const result = await getUserByPasswordToken(token);

    if (result instanceof DatabaseError) {
      logger.error('SQL Error Message:', result.original.message);
      throw new ServerError(result.original.message, 'auth-service resetPassword method() error');
    }

    const checkUser = result as IAuthDocument;

    if (!checkUser) {
      throw new BadRequestError('Reset token has expired', 'Password resetPassword() method error');
    }

    const hashPassword = await AuthModel.prototype.hashPassword(password);

    await updatePassword(checkUser.id!, hashPassword);

    const message: IEmailMessageDetails = {
      username: checkUser.username,
      template: 'resetPasswordSuccess'
    };

    await publicDirectMessage(
      authChannel,
      config.EMAIL_EXCHANGE_NAME,
      config.EMAIL_QUEUE_NAME,
      JSON.stringify(message),
      'Password change success message sent to notification service.'
    );

    res.status(StatusCodes.OK).json({ message: 'Password successfully updated.' });
    logger.info('Password successfully updated.');
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = changePasswordSchema.validate(req.body);

    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'Password changePassword() method error');
    }

    const { newPassword } = req.body;

    const result = await getUserByEmail(req.currentUser.email);

    if (result instanceof DatabaseError) {
      logger.error('SQL Error Message:', result.original.message);
      throw new ServerError(result.original.message, 'auth-service changePassword method() error');
    }

    const checkUser = result as IAuthDocument;

    if (!checkUser) {
      throw new BadRequestError('Invalid password', 'Password changePassword() method error');
    }

    const messageDetails: IEmailMessageDetails = {
      username: checkUser.username,
      template: 'resetPasswordSuccess'
    };

    const hashPassword = await AuthModel.prototype.hashPassword(newPassword);

    await updatePassword(checkUser.id!, hashPassword);

    await publicDirectMessage(
      authChannel,
      config.EMAIL_EXCHANGE_NAME,
      config.EMAIL_ROUTING_KEY,
      JSON.stringify(messageDetails),
      'Password change success message sent to notification service.'
    );

    res.status(StatusCodes.CREATED).json({ message: 'Password successfully changed.' });
  } catch (err) {
    next(err);
  }
}