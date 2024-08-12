import { password } from '@gateway/controller/auth/passport';

import { signIn } from '@gateway/controller/auth/signin';
import { signOut } from '@gateway/controller/auth/signout';
import { signUp } from '@gateway/controller/auth/signup';
import { verifyEmail } from '@gateway/controller/auth/verifyEmail';
import { verifyOTP } from '@gateway/controller/auth/verifyOTP';
import express, { Router } from 'express';

class AuthRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/auth/sign-up', signUp.create);
    this.router.post('/auth/sign-in', signIn.read);
    this.router.patch('/auth/sign-out', signOut.update);
    this.router.put('/auth/verify-email', verifyEmail.update);
    this.router.put('/auth/verify-otp/:otp', verifyOTP.update);
    this.router.put('/auth/forget-password', password.forgetPassword);
    this.router.post('/auth/reset-password/:token', password.resetPassword);
    this.router.put('/auth/change-password', password.changePassword);

    return this.router;
  }
}

export const authRoute: AuthRoute = new AuthRoute();
