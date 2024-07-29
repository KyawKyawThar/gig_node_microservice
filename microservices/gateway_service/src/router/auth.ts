import { signUp } from '@gateway/controller/auth/signup';
import express, { Router } from 'express';

class AuthRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/auth/sign-up', signUp.create);

    return this.router;
  }
}

export const authRoute: AuthRoute = new AuthRoute();
