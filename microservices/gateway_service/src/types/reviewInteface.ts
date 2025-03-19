export interface IReviewMessageDetails {
  gigId?: string;
  reviewerId?: string;
  sellerId?: string;
  review?: string;
  rating?: number;
  orderId?: string;
  createdAt?: string;
  type?: string;
}

export interface IReviewDocument {
  _id?: string;
  gigId: string;
  reviewerId: string;
  sellerId: string;
  review: string;
  reviewerImage: string;
  rating: number;
  orderId: string;
  createdAt: Date | string;
  reviewerUsername: string;
  country: string;
  reviewType?: string;
}

export interface IReviewPayload {
  id: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}
