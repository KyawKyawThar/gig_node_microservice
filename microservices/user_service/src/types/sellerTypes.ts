import { ObjectId } from 'mongoose';

// By extending ISellerDocument with the Record<string, any> you allow an object to contain other
// string keys with any values along with those defined in the interface.
// The nice part is that you still have the autocompletion for the defined properties

export type SellerType =
  | string
  | string[]
  | Number
  | Date
  | IRatingCategories[]
  | IExperience
  | IExperience[]
  | IEducation
  | IEducation[]
  | ICertificate
  | ICertificate[]
  | ILanguage
  | ILanguage[]
  | ObjectId
  | undefined;

export interface IRatingCategories {
  five: IRatingCategoryItem;
  four: IRatingCategoryItem;
  three: IRatingCategoryItem;
  two: IRatingCategoryItem;
  one: IRatingCategoryItem;
}

export interface IBuyerDocument {
  _id?: string | ObjectId;
  username: string;
  email: string;
  profilePicture: string;
  country: string;
  isSeller?: boolean;
  purchasedGigs?: string[];
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface ILanguage {
  [key: string]: string | number | undefined;
  _id?: string;
  language: string;
  level: string;
}

export interface IRatingCategoryItem {
  value: string;
  count: number;
}

export interface IExperience {
  [key: string]: string | number | Date | boolean | undefined;
  _id?: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  currentlyWorkingHere: boolean;
}

export interface IEducation {
  [key: string]: string | Date | undefined;
  country: string;
  title: string;
  university: string;
  major: string;
  year: string;
}

export interface ICertificate {
  [key: string]: string | undefined | number;
  name: string;
  from: string;
  to: number;
}
export interface ISellerDocument extends Record<string, SellerType> {
  _id?: string | ObjectId;
  profilePublicID?: string;
  fullName: string;
  userName?: string;
  email?: string;
  profilePicture?: string;
  description: string;
  country: string;
  onliner: string;
  skills: string[];
  ratingCount?: Number;
  ratingSum?: Number;
  ratingCategories?: IRatingCategories[];
  languages: ILanguage[];
  responseTime: number;
  responseDeliveries?: Date | string;
  experience: IExperience[];
  educations: IEducation[];
  socialLinks: string[];
  certificates: ICertificate[];
  ongoingJobs?: number;
  completedJobs?: number;
  cancelJobs?: number;
  totalEarning?: number;
  totalGigs?: number;
  createdAt?: Date | string;
}
export interface ISellerOrderMessage {
  sellerId: string;
  ongoingJobs: number;
  completedJobs: number;
  totalEarnings: number;
  recentDelivery: Date;
}

export interface IBuyerReviewMessageDetails {
  gigId?: string;
  reviewerId?: string;
  sellerId?: string;
  review?: string;
  rating?: number;
  orderId?: string;
  createdAt?: string;
  type: string;
}

export interface IRatingTypes {
  [key: string]: string;
}
