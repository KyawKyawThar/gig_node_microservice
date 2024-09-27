import { winstonLogger } from '@user/logger';
import { config } from '@user/config';
import { Response, Request, NextFunction } from 'express';
// import { sellerSchemaValidate } from '@user/schemes/seller';
// import { BadRequestError, NotFoundError } from '@user/errorHandler';
// import { ValidationError } from 'joi';
// import { createSeller, getSellerByEmail } from '@user/services/seller.service';
// import { ISellerDocument } from '@user/types/sellerTypes';
// import { StatusCodes } from 'http-status-codes';

const logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'seller-service', 'debug');

export async function sellerCreate(_req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    logger.info('sellerCreate called');
    // const error = Promise.resolve(sellerSchemaValidate.validate(req.body)) as unknown as ValidationError;
    // if (error?.details) {
    //   throw new BadRequestError(error.details[0].message, 'Create seller() method error');
    // }
    // const checkIfSellerExists: ISellerDocument | null = await getSellerByEmail(req.body.email);
    // if (checkIfSellerExists) {
    //   throw new NotFoundError('Seller already exist. Go to your account page to update.', 'Create seller() method error');
    // }
    // const sellerData: ISellerDocument = {
    //   profilePublicID: req.body.profilePublicID,
    //   fullName: req.body.fullName,
    //   userName: req.body.userName,
    //   email: req.body.email,
    //   profilePicture: req.body.profilePicture,
    //   description: req.body.description,
    //   oneliner: req.body.oneliner,
    //   country: req.body.country,
    //   skills: req.body.skills,
    //   languages: req.body.languages,
    //   responseTime: req.body.responseTime,
    //   experience: req.body.experience,
    //   education: req.body.education,
    //   socialLinks: req.body.socialLinks,
    //   certificates: req.body.certificates,
    //   onliner: req.body.onliner,
    //   educations: req.body.educations
    // };
    // const create = await createSeller(sellerData);
    // res.status(StatusCodes.CREATED).json({ message: "'Seller created successfully.", seller: create });
    // logger.info('Seller created successfully...');
  } catch (err) {
    next(err);
  }
}
