import { AxiosInstance as reviewInstance, AxiosResponse } from 'axios';
import { AxiosService } from '@gateway/services/axios';
import { config } from '@gateway/config';
import { IReviewDocument } from '@gateway/types/reviewInteface';

export let axiosReviewInstance: reviewInstance;

class ReviewService {
  constructor() {
    const axiosService: AxiosService = new AxiosService(`${config.REVIEW_BASE_URL}/api/v1/review`, 'review');
    axiosReviewInstance = axiosService.kkt;
  }

  async getReviewsByGigId(gigId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosReviewInstance.get(`/gig/${gigId}`);
    return response;
  }

  async getReviewsBySellerId(sellerId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosReviewInstance.get(`/seller/${sellerId}`);
    return response;
  }

  async addReview(body: IReviewDocument): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosReviewInstance.post('/', body);
    return response;
  }
}

export const reviewService = new ReviewService();
