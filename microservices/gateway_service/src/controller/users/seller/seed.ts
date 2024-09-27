import { NextFunction, Request, Response } from 'express';
import { sellerService } from '@gateway/services/api/sellerService';
import { StatusCodes } from 'http-status-codes';

export class Seller {
  public async seed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await sellerService.seed(req.params.count);
      res.status(StatusCodes.OK).json({ message: response.data.message, seller: response.data.seller });
    } catch (e) {
      next(e);
    }
  }
}
