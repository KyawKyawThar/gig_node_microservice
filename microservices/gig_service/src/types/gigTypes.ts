// This code snippet is a TypeScript declaration
//that extends the Express namespace to include additional
//properties on the Request object

import { Field, SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { QueryDslRangeQuery } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { ObjectId } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      currentUser: IAuthPayload;
    }
  }
}

export type SellerType =
  | string
  | string[]
  | number
  | Date
  | IRatingCategories
  | IExperience
  | IExperience[]
  | IEducation
  | IEducation[]
  | ICertificate[]
  | ILanguage
  | ILanguage[]
  | undefined
  | unknown;

export interface ICertificate {
  [key: string]: string | Date | undefined;
  name: string;
  from: Date;
  to: Date;
}
export interface IExperience {
  [key: string]: string | number | Date | boolean | undefined;
  _id?: string;
  company: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  currentlyWorkingHere: boolean;
}
export interface IEducation {
  [key: string]: string | Date | undefined;
  country: string;
  title: string;
  university: string;
  major: string;
  year: Date;
}
export interface IAuthPayload {
  id: number;
  username: string;
  email: string;
  iat?: number;
}

export interface IAuth {
  username?: string;
  email?: string;
  password?: string;
  country?: string;
  profilePicture?: string;
}

export interface IAuthDocument {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  country?: string;
  profilePublicId?: string;
  profilePicture?: string;
  emailVerified?: number;
  emailVerificationToken?: string;
  browserName: string;
  deviceType: string;
  otp?: string;
  otpExpirationDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}
export interface IAuthBuyerMessageDetails {
  username?: string;
  profilePicture?: string;
  email?: string;
  country?: string;
  createdAt?: Date;
  type?: string;
}
export interface IEmailMessageDetails {
  receiverEmail?: string;
  template?: string;
  verifyLink?: string;
  resetLink?: string;
  username?: string;
  otp?: string;
}

export interface IPaginateProps {
  from: string;
  size: number;
  type: string;
}

export interface IHitTotal {
  value: number;
  relation: string;
}

export interface Iterm {
  active: boolean;
}

export interface IQueryString {
  fields: string[];
  query: string;
}

export interface IQueryList {
  range?: Partial<Record<Field, QueryDslRangeQuery>>;
  term?: Iterm;
  query_string?: IQueryString;
}

export interface ISearchResult {
  hits: SearchHit[];
  total: number;
}
export interface IRatingCategoryItem {
  value: number;
  count: number;
}

export interface IRatingCategories {
  five: IRatingCategoryItem;
  four: IRatingCategoryItem;
  three: IRatingCategoryItem;
  two: IRatingCategoryItem;
  one: IRatingCategoryItem;
}
export interface IBuyerReviewMessageDetails {
  gigId: string;
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
export interface ISellerGig {
  _id?: string;
  // this "id" property is used because elastcisearch does not accept a key with an underscore "_id"
  // elasticsearch has _id as a reserved field name
  id?: string;
  sellerId?: string | ObjectId;
  title: string;
  username?: string;
  profilePicture?: string;
  email?: string;
  description: string;
  active?: boolean;
  categories: string;
  subCategories: string[];
  tags: string[];
  ratingsCount?: number; // make sure to add this to elasticsearch as a double
  ratingSum?: number; // make sure to add this to elasticsearch as a double
  ratingCategories?: IRatingCategories;
  expectedDelivery: string;
  basicTitle: string;
  basicDescription: string;
  price: number;
  coverImage: string;
  createdAt?: Date | string;
  sortId?: number;
  toJSON?: () => unknown;
}

export interface ILanguage {
  [key: string]: string | number | undefined;
  _id?: string;
  language: string;
  level: string;
}

export interface ISellerDocument extends Record<string, SellerType> {
  _id?: string | ObjectId;
  fullName: string;
  userName: string;
  email: string;
  profilePicture: string;
  description: string;
  profilePublicID: string;
  onliner: string;
  languages: ILanguage[];
  skills: string;
  ratingCount: number;
  ratingCategories: IRatingCategories[];
  responseTime: Date;
  responseDeliveries: Date;
  experience: IExperience[];
  educations: IEducation[];
  socialLinks: string;
  certificates: ICertificate[];
  ongoingJobs: number;
  completedJobs: number;
  cancelJobs: number;
  totalEarning: number;
  totalGigs: number;
  createdAt: Date | string;
}
