// This code snippet is a TypeScript declaration
//that extends the Express namespace to include additional
//properties on the Request object

import { Field, SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { QueryDslRangeQuery } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';

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
  exp?: number;
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

export interface ISellerGig {
  _id?: string;
  id?: string;
  sellerId?: string;
  title: string;
  username?: string;
  profilePicture?: string;
  email?: string;
  description: string;
  active?: boolean;
  categories: string;
  subCategories: string[];
  tags: string[];
  ratingsCount?: number;
  ratingSum?: number;
  ratingCategories?: IRatingCategories;
  expectedDelivery: string;
  basicTitle: string;
  basicDescription: string;
  price: number;
  coverImage: string;
  createdAt?: Date | string;
  sortId?: number;
}
