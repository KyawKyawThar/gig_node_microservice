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

export interface IAuth {
  username?: string;
  email?: string;
  password?: string;
  country?: string;
  profilePicture?: string;
}
