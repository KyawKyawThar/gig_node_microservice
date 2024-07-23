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

export interface IAuth {
  username?: string;
  email?: string;
  password?: string;
  country?: string;
  profilePicture?: string;
}
