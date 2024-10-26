// By extending ISellerDocument with the Record<string, any> you allow an object to contain other
// string keys with any values along with those defined in the interface.
// The nice part is that you still have the autocompletion for the defined properties

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

export interface IRatingCategories {
  five: IRatingCategoryItem;
  four: IRatingCategoryItem;
  three: IRatingCategoryItem;
  two: IRatingCategoryItem;
  one: IRatingCategoryItem;
}

export interface IBuyerDocument {
  username: string;
  email: string;
  profilePicture: string;
  country: string;
  isSeller: boolean;
  purchasedGigs?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
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

export interface ICertificate {
  [key: string]: string | Date | undefined;
  name: string;
  from: Date;
  to: Date;
}
export interface ISellerDocument extends Record<string, SellerType> {
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
