import crypto from 'crypto';

import { config } from '@auth/config';
import { BadRequestError } from '@auth/errorHandler';
import { createUser, firstLetterUpperCase, getUserByEmailORUsername } from '@auth/services/auth.service';
import { faker } from '@faker-js/faker';
import { uniqueNamesGenerator, Config, names } from 'unique-names-generator';
import { winstonLogger } from '@auth/logger';
import { Logger } from 'winston';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { IAuthDocument } from '@auth/types/authTypes';
import { sample } from 'lodash';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');

export async function createSeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { count } = req.params;

    const config: Config = {
      dictionaries: [names]
    };

    for (let i = 0; i < parseInt(count, 10); i++) {
      const username = uniqueNamesGenerator(config);
      const email = `${username}@gmail.com`;
      const checkIfUserAlreadyExists = await getUserByEmailORUsername(username, email);

      if (checkIfUserAlreadyExists) {
        throw new BadRequestError('Invalid credentials. Email or Username', 'Seed create() method error');
      }
      const password = 'qwerty';
      const country = faker.location.country();
      const profilePicture = faker.image.urlPicsumPhotos();

      const profilePublicId = uuidV4();
      const randomBytes = Promise.resolve(crypto.randomBytes(24));
      const randomCharacter = (await randomBytes).toString('hex');

      const authData = {
        username: firstLetterUpperCase(username),
        email: email.toLowerCase(),
        profilePicture,
        profilePublicId,
        password,
        country,
        browserName: 'chrome',
        deviceType: 'mobile',
        emailVerificationToken: randomCharacter,
        emailVerified: sample([0, 1])
      } as IAuthDocument;

      await createUser(authData);
    }
    res.status(StatusCodes.CREATED).json({ message: 'Seed users created successfully.' });
    logger.info('User seed has been get successfully');
  } catch (err) {
    next(err);
  }
}
