import { password } from '@gateway/controller/auth/passport';

import { signIn } from '@gateway/controller/auth/signin';
import { signOut } from '@gateway/controller/auth/signout';
import { signUp } from '@gateway/controller/auth/signup';
import { verifyEmail } from '@gateway/controller/auth/verifyEmail';
import { verifyOTP } from '@gateway/controller/auth/verifyOTP';
import express, { Router } from 'express';
import { authMiddleware } from '@gateway/services/auth-middleware';
import { createAuthSeed } from '@gateway/controller/auth/seed';
import { currentUser } from '@gateway/controller/auth/currentUser';

class AuthRoute {
  private readonly router: Router;

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
    this.router.put('/auth/change-password', authMiddleware.verifyUser, password.changePassword);
    this.router.post('/auth/seed/:count', createAuthSeed.seed);
    this.router.post('/auth/resend-email', currentUser.resendEmail);

    return this.router;
  }
}

export const authRoute: AuthRoute = new AuthRoute();
