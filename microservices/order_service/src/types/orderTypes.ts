declare global {
  namespace Express {
    interface Request {
      currentUser: IOrderPayload;
    }
  }
}

export interface IOrderPayload {
  id: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface IOrderNotification {
  _id?: string;
  userToId: string;
  senderUsername: string;
  senderPicture: string;
  receiverUsername: string;
  receiverPicture: string;
  isRead?: boolean;
  orderId: string;
  type?: string;
  message: string;
  rating?: number;
  createdAt?: Date;
}
export interface IOrderDocument {
  gigId: string;
  sellerId: string;
  sellerUsername: string;
  sellerImage: string;
  sellerEmail: string;
  gigCoverImage: string;
  gigMainTitle: string;
  gigBasicTitle: string;
  gigBasicDescription: string;
  buyerId: string;
  buyerUsername: string;
  buyerEmail: string;
  buyerImage: string;
  status: string;
  orderId: string;
  invoiceId: string;
  quantity: number;
  price: number;
  offer: IOffer;
  requestExtension?: IExtendedDelivery;
  serviceFee?: number;
  requirements?: string;
  approved?: boolean;
  cancelled?: boolean;
  delivered?: boolean;
  approvedAt?: string;
  deliveredWork?: IDeliveredWork[];
  dateOrdered?: string;
  events: IOrderEvents;
  buyerReview?: IOrderReview;
  sellerReview?: IOrderReview;
  paymentIntent?: string;
}
export interface IExtendedDelivery {
  originalDate: string;
  newDate: string;
  days: number;
  reason: string;
  deliveryDateUpdate?: string;
}
export interface IDeliveredWork {
  message: string;
  file: string;
  fileType: string;
  fileSize: number;
  fileName: string;
}
export interface IOrderEvents {
  placeOrder: string;
  requirements: string;
  orderStarted: string;
  deliveryDateUpdate?: string;
  orderDelivered?: string;
  buyerReview?: string;
  sellerReview?: string;
}
export interface IOrderReview {
  rating: number;
  review: string;
  date?: string;
}
export interface IOffer {
  [key: string]: string | number | boolean | undefined;
  gigTitle: string;
  price: number;
  description: string;
  deliveryInDays: number;
  oldDeliveryDate: string;
  newDeliveryDate: string;
  accepted: boolean;
  cancelled: boolean;
  reason?: string; // this is the reason for extending the delivery date
}

export interface IOrderMessage {
  sellerId?: string;
  buyerId?: string;
  ongoingJobs?: number;
  completedJobs?: number;
  totalEarnings?: number;
  purchasedGigs?: string;
  recentDelivery?: string;
  type?: string;
  receiverEmail?: string;
  username?: string;
  template?: string;
  sender?: string;
  offerLink?: string;
  amount?: string;
  buyerUsername?: string;
  sellerUsername?: string;
  title?: string;
  description?: string;
  deliveryDays?: string;
  orderId?: string;
  invoiceId?: string;
  orderDue?: string;
  requirements?: string;
  orderUrl?: string;
  originalDate?: string;
  newDate?: string;
  reason?: string;
  subject?: string;
  header?: string;
  total?: string;
  message?: string;
  serviceFee?: string;
}
export interface IReviewMessageDetails {
  gigId?: string;
  reviewerId?: string;
  sellerId?: string;
  review?: string;
  rating?: number;
  orderId?: string;
  createdAt?: string;
  type: string;
}

interface StripeError extends Error {
  type?: string;
  code?: string;
  statusCode?: number;
}

export const IsStripeError = (err: unknown): err is StripeError => {
  return err instanceof Error && 'type' in err;
};
