import { Logger } from 'winston';
import { winstonLogger } from '@user/logger';
import { config } from '@user/config';
import { NextFunction, Request, Response } from 'express';
import { updateSeller } from '@user/services/seller.service';
import { StatusCodes } from 'http-status-codes';

// import { sellerSchemaValidate } from '@user/schemes/seller';
// import { BadRequestError } from '@user/errorHandler';
// import { ISellerDocument } from '@user/types/sellerTypes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'seller-service', 'debug');

export const sellerUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // const { error } = Promise.resolve(sellerSchemaValidate.validate(req.body));

    // if (error.details) {
    //   throw new BadRequestError(error.details[0].message, 'Update seller() method error');
    // }

    // const sellerData: ISellerDocument = {
    //   profilePublicID: req.body.profilePublicID,
    //   fullName: req.body.fullName,
    //   profilePicture: req.body.profilePicture,
    //   description: req.body.description,
    //   country: req.body.country,
    //   languages: req.body.languages,
    //   responseTime: req.body.responseTime,
    //   experience: req.body.experience,
    //   educations: req.body.educations,
    //   socialLinks: req.body.socialLinks,
    //   certificates: req.body.certificates,

    //   onliner: req.body.onliner,
    //   skills: req.body.skills
    // };

    // console.log('sellerUpdate.....');
    const sellerData = req.body;
    const update = await updateSeller(req.params.sellerId, sellerData);

    res.status(StatusCodes.OK).json({ message: "'Seller have been update successfully.", seller: update });
    logger.info('Seller update successfully...');
  } catch (err) {
    next(err);
  }
};
