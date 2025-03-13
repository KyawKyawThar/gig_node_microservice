import crypto from 'crypto';

import { BadRequestError } from '@chats/errorHandler';
import { messageSchema } from '@chats/schema/message';
import { NextFunction, Request, Response } from 'express';
import { upload } from '@chats/cloudinaryUpload';
import { IMessageDocument, UploadApiResponse } from '@chats/types/chatTypes';
import { addMessage, createConversation } from '@chats/services/message.service';
import { StatusCodes } from 'http-status-codes';
import { winstonLogger } from '@chats/logger';
import { Logger } from 'winston';
import { config } from '@chats/config';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chat_service', 'debug');

export const createMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = messageSchema.validate(req.body);

    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'chat-service chat-service createMessage() method error');
    }
    let file;

    if (req.body.file) {
      let uploadURL: UploadApiResponse;
      file = req.body.file;
      const randomBytes = crypto.randomBytes(20);

      const randomCharacter = randomBytes.toString('hex');
      uploadURL = (
        req.body.fileType === 'zip' ? await upload(req.body.file, `${randomCharacter}.zip`) : await upload(req.body.file)
      ) as UploadApiResponse;

      if (!uploadURL.public_id) {
        throw new BadRequestError(
          'File upload error from cloudinary service.Can be ISP block to use this service',
          'Signup uploadResult() method error'
        );
      }
      file = uploadURL.secure_url;
    }

    const data: IMessageDocument = {
      conversationId: req.body?.conversationId,
      body: req.body.body,
      file,
      fileType: req.body.fileType,
      fileSize: req.body.fileSize,
      fileName: req.body.fileName,
      gigId: req.body.gigId,
      buyerId: req.body.buyerId,
      sellerId: req.body.sellerId,
      senderUsername: req.body.senderUsername,
      senderPicture: req.body.senderPicture,
      receiverUsername: req.body.receiverUsername,
      receiverPicture: req.body.receiverPicture,
      isRead: req.body.isRead,
      hasOffer: req.body.hasOffer,
      offer: req.body.offer
    };

    if (!req.body.hasConversationId) {
      console.log('data is : ', data);
      await createConversation(data.conversationId, data?.senderUsername!, data?.receiverUsername!);
    }

    const result = await addMessage(data);

    res.status(StatusCodes.OK).json({ message: 'Message added', conversationId: result.conversationId, result });

    logger.info('chat_service createMessage successfully');
  } catch (error) {
    next(error);
  }
};
