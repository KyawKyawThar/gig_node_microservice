import crypto from 'crypto';

import { config } from '@auth/config';
import { BadRequestError, ServerError } from '@auth/errorHandler';
import { winstonLogger } from '@auth/logger';
import { getUserByEmail, getUserByID, updateVerifyEmail } from '@auth/services/auth.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';
import { IAuthDocument, IEmailMessageDetails } from '@auth/types/authTypes';
import { publicDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { DatabaseError } from 'sequelize';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');

export async function currentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getUserByID(req.currentUser.id);

    if (result instanceof DatabaseError) {
      logger.error('SQL Error Message:', result.original.message);
      throw new ServerError(result.original.message, 'auth-service currentUser method() error');
    }

    const currentUser = result as IAuthDocument;
    if (!currentUser) {
      throw new BadRequestError('user does not exist', 'auth-service currentUser method() error');
    }

    res.status(StatusCodes.OK).json({ message: 'Authenticated user', user: currentUser });

    logger.info('Current user request has been get successfully');
  } catch (error) {
    next(error);
  }
}

export async function resendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    const result = await getUserByEmail(email.toLowerCase());

    if (result instanceof DatabaseError) {
      logger.error('SQL Error Message:', result.original.message);
      throw new ServerError(result.original.message, 'auth-service resendEmail method() error');
    }
    const user = result as IAuthDocument;

    if (user?.emailVerified) {
      throw new BadRequestError('User already verified email,do not need to do it again', 'auth-service resendEmail method() error');
    }

    const checkUserIfExists = await getUserByID(user.id!);
    if (!checkUserIfExists) {
      throw new BadRequestError('user does not exist', 'auth-service verifyEmail method() error');
    }

    const randomByte = crypto.randomBytes(20);
    const randomCharacter = randomByte.toString('hex');

    const verifyEmailLink = `${config.CLIENT_URL}/confirm_email?v_token=${randomCharacter}`;

    const messageDetail: IEmailMessageDetails = {
      receiverEmail: email,
      template: 'verifyEmail',
      verifyLink: verifyEmailLink
    };

    await publicDirectMessage(
      authChannel,
      config.EMAIL_EXCHANGE_NAME,
      config.EMAIL_ROUTING_KEY,
      JSON.stringify(messageDetail),
      'Verify email message has been sent to notification service.'
    );

    await updateVerifyEmail(user.id!, 0, randomCharacter);

    const updateUser = await getUserByID(user.id!);

    res.status(StatusCodes.CREATED).json({ message: 'Email verification sent', user: updateUser });
  } catch (error) {
    next(error);
  }
}
