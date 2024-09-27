import crypto from 'crypto';

import { upload } from '@auth/cloudinaryUpload';
import { BadRequestError, ServerError } from '@auth/errorHandler';
import { signupSchema } from '@auth/schemes/signup';
import { createUser, firstLetterUpperCase, getUserByEmailORUsername, signToken } from '@auth/services/auth.service';
import { IAuthDocument, IEmailMessageDetails } from '@auth/types/authTypes';
import { UploadApiResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { publicDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { config } from '@auth/config';
import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { winstonLogger } from '@auth/logger';
import { DatabaseError } from 'sequelize';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');

export async function signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'auth-service signUp create() method error');
    }
    const { username, email, password, country, profilePicture, browserName, deviceType } = req.body;

    const user = await getUserByEmailORUsername(username, email);

    if (user instanceof DatabaseError) {
      logger.error('SQL Error Message:', user.original.message);
      throw new ServerError(user.original.message, 'auth-service signUp create() method error');
    }

    const checkIfUserExists = user as IAuthDocument;
    if (checkIfUserExists) {
      throw new BadRequestError('User already exists..Try different using email or username', 'Signup() method error');
    }

    const profilePublicId = uuidv4();
    const uploadResult = (await upload(profilePicture, `${profilePublicId}`, true, true)) as UploadApiResponse;

    if (!uploadResult.public_id) {
      throw new BadRequestError(
        'File upload error from cloudinary service.Can be ISP block to use this service',
        'Signup uploadResult() method error'
      );
    }
    const randomByte = crypto.randomBytes(20);
    const randomCharacter = randomByte.toString('hex');

    const data: IAuthDocument = {
      username: firstLetterUpperCase(username),
      email: email.toLowerCase(),
      password,
      country,
      profilePublicId,
      browserName,
      deviceType,
      profilePicture: uploadResult.secure_url,
      emailVerificationToken: randomCharacter
    } as IAuthDocument;

    const newUser = await createUser(data);

    if (newUser instanceof DatabaseError) {
      logger.error('SQL Error Message:', newUser.original.message);
      throw new ServerError(newUser.original.message, 'auth-service verifyOTP method() error');
    }

    const result = newUser as IAuthDocument;

    const verifyEmailLink = `${config.CLIENT_URL}/confirm_email?v_token=${randomCharacter}`;
    const messageDetail: IEmailMessageDetails = {
      receiverEmail: result?.email,
      username: result?.username,
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
    if (result) {
      const userJWT = signToken(result.id!, result.username!, result.email!);
      res.status(StatusCodes.OK).json({ message: 'User created successfully', user: result, token: userJWT });
      logger.info('User created successfully....');
    }
  } catch (error) {
    next(error);
  }
}
