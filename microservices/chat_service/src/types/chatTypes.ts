//You would use this pattern when you want to store custom information
//on the Request object and need TypeScript to recognize this additional
//property. Common use cases include:

import mongoose, { Document } from 'mongoose';

//Authenticated User Information: Adding user information after authentication,
//allowing you to access req.currentUser throughout your app with type safety.
//Custom Data Passed Across Middleware: For example, if you attach specific data
// in middleware (e.g., req.customData), you can declare it in the Request type to avoid
// TypeScript errors and gain type checking.
declare global {
  namespace Express {
    interface Request {
      currentUser: IAuthPayload;
    }
  }
}

export interface IAuthPayload {
  id: number;
  username: string;
  email: string;
  iat?: number;
}
//If you only use IConversation, you won’t have access to Mongoose-specific document
//properties and methods (like _id, save(), etc.),
export interface IConversationDocument extends Document {
  _id: mongoose.Types.ObjectId | string;
  conversationId: string;
  senderUsername: string;
  receiverUsername: string;
}

export interface IMessageDocument {
  _id?: mongoose.Types.ObjectId | string;
  conversationId: string;
  body?: string;
  url?: string;
  file?: string;
  fileType?: string;
  fileSize?: string;
  fileName?: string;
  gigId?: string;
  sellerId?: string;
  buyerId?: string;
  senderUsername?: string;
  senderPicture?: string;
  receiverUsername?: string;
  receiverPicture?: string;
  isRead?: boolean;
  hasOffer?: boolean;
  offer?: IOffer;
  hasConversationId?: boolean;
  createdAt?: Date | string;
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
export interface IMessageDetails {
  sender?: string;
  offerLink?: string;
  amount?: number;
  buyerUsername?: string;
  sellerUsername?: string;
  title?: string;
  description?: string;
  deliveryDays?: string;
  template?: string;
}

export interface UploadApiResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: 'image' | 'video' | 'raw' | 'auto';
  created_at: string;
  tags: Array<string>;
  pages: number;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  access_mode: string;
  original_filename: string;
  moderation: Array<string>;
  access_control: Array<string>;
  context: object; //won't change since it's response, we need to discuss documentation team about it before implementing.
  metadata: object; //won't change since it's response, we need to discuss documentation team about it before implementing.
  colors?: [string, number][];

  [futureKey: string]: any;
}
