import { upload } from '@gig/cloudinaryUpload';
import { config } from '@gig/config';
import { BadRequestError, NotFoundError } from '@gig/errorHandler';
import { winstonLogger } from '@gig/logger';
import { updateActiveGig, updateGig } from '@gig/services/gig.service';
import { UpdateISellerGig } from '@gig/types/gigTypes';
import { UploadApiResponse } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import { isDataURL } from 'helper';
import { StatusCodes } from 'http-status-codes';
//import { gigUpdateSchema } from 'schema/gig';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig-service', 'debug');
export const gigsByUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const { error } = gigUpdateSchema.validate(req.body);

    // if (error?.details) {
    //   throw new BadRequestError(error.details[0].message, 'gig-service gigsByUpdate() method error');
    // }

    const isDataUrl = isDataURL(req.body.coverImage);
    let coverImage = '';
    if (isDataUrl) {
      const uploadImage = (await upload(req.body.coverImage)) as UploadApiResponse;

      if (!uploadImage.public_id) {
        throw new BadRequestError(
          'File upload error from cloudinary service.Can be ISP block to use this service',
          'Signup gig() method error'
        );
      }

      coverImage = uploadImage.secure_url;
    } else {
      coverImage = req.body.coverImage;
    }

    const gig: UpdateISellerGig = {
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories,
      subCategories: req.body.subCategories,
      tags: req.body.tags,
      price: req.body.price,
      expectedDelivery: req.body.expectedDelivery,
      basicTitle: req.body.basicTitle,
      basicDescription: req.body.basicDescription,
      coverImage
    };

    const result = await updateGig(gig, req.params.gigId);
    if (!Object.keys(result).length) {
      throw new NotFoundError('gig can not be updated with this gigID', 'gig-service gigsByUpdate() method: error');
    }
    res.status(StatusCodes.OK).json({ message: 'Gig updated successfully', gig: result });

    logger.info('gig has been updated successfully');
  } catch (error) {
    next(error);
  }
};

export const activeUpdateGigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gigId } = req.params;

    const result = await updateActiveGig(gigId, req.body.active);

    if (!Object.keys(result).length) {
      throw new NotFoundError('gig can not be updated with this gigId', 'gig-service activeUpdateGigs() method: error');
    }
    res.status(StatusCodes.OK).json({ message: 'Gig updated successfully', gig: result });

    logger.info('active update gigs successfully');
  } catch (error) {
    next(error);
  }
};
