import crypto from 'crypto';

import { upload } from '@auth/cloudinaryUpload';
import { BadRequestError } from '@auth/errorHandler';
import { signupSchema } from '@auth/schemes/signup';
import { createUser, firstLetterUpperCase, getUserByEmailORUsername, signToken } from '@auth/services/auth.service';
import { IAuthDocument, IEmailMessageDetails } from '@auth/types/authTypes';
import { UploadApiResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import { publicDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { config } from '@auth/config';
import { upperCase } from 'lodash';
import { NextFunction, Request, Response } from 'express';

export async function signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'auth-service signUp create() method error');
    }
    const { username, email, password, country, profilePicture, browserName, deviceType } = req.body;

    const checkIfUserExists = await getUserByEmailORUsername(username, email);
    if (checkIfUserExists) {
      throw new BadRequestError('Invalid Credentials Email or Username', 'Signup getUserByEmailORUsername() method error');
    }

    const profilePublicId = uuidv4();
    const uploadResult = (await upload(profilePicture, `${profilePublicId}`, true, true)) as UploadApiResponse;

    if (!uploadResult.public_id) {
      throw new BadRequestError(
        'File upload error from cloudinary service.Can be ISP block to use this service',
        'Signup uploadResult() method error'
      );
    }
    const randomByte = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacter = randomByte.toString('hex');

    const data: IAuthDocument = {
      username: firstLetterUpperCase(username),
      email: upperCase(email),
      password,
      country,
      profilePublicId,
      browserName,
      deviceType,
      profilePicture: uploadResult.secure_url,
      emailVerificationToken: randomCharacter
    } as IAuthDocument;

    const result = await createUser(data);

    const verifyEmailLink = `${config.CLIENT_URL}/confirm_email?v_token=${randomCharacter}`;
    const messageDetail: IEmailMessageDetails = {
      receiverEmail: result?.email,
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
    }
  } catch (error) {
    next(error);
  }
}
