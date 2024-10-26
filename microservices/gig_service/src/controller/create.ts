import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { config } from '@gig/config';
import { winstonLogger } from '@gig/logger';
import { ISellerGig } from '@gig/types/gigTypes';
import { gigCreateSchema } from 'schema/gig';
import { BadRequestError } from '@gig/errorHandler';
import { getDocumentCount } from '@gig/elasticSearch';
import { upload } from '@gig/cloudinaryUpload';
import { UploadApiResponse } from 'cloudinary';
import { StatusCodes } from 'http-status-codes';
import { createGig } from '@gig/services/gig.service';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig-service', 'debug');
export const gigsByCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = gigCreateSchema.validate(req.body);

    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'gig-service gigsByCreate() method error');
    }
    const uploadImage = (await upload(req.body.coverImage)) as UploadApiResponse;

    if (!uploadImage.public_id) {
      throw new BadRequestError(
        'File upload error from cloudinary service.Can be ISP block to use this service',
        'Signup gig() method error'
      );
    }

    const count: number = await getDocumentCount(config.GIGS);

    const gig: ISellerGig = {
      sellerId: req.body.sellerId,
      title: req.body.title,
      username: req.currentUser.username,
      profilePicture: req.body.profilePicture,
      email: req.currentUser.email,
      description: req.body.description,
      categories: req.body.categories,
      subCategories: req.body.subCategories,
      tags: req.body.tags,
      price: req.body.price,
      expectedDelivery: req.body.expectedDelivery,
      basicTitle: req.body.basicTitle,
      basicDescription: req.body.basicDescription,
      coverImage: `${uploadImage.secure_url}`,
      sortId: count + 1
    };

    const result = await createGig(gig);

    res.status(StatusCodes.CREATED).json({ message: 'crated gig successfully', result });

    logger.info('gig has been create successfully');
  } catch (error) {
    next(error);
  }
};
