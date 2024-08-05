import { changePassword, forgetPassword, resetPassword } from '@auth/controller/password';
import { signIn } from '@auth/controller/signIn';
import { signUp } from '@auth/controller/signup';
import { verifyEmail } from '@auth/controller/verifyEmail';
import { verifyOTP } from '@auth/controller/verifyOTP';
import express, { Router } from 'express';

const router: Router = express.Router();

//put(`/verify-otp/${otp}`, body);
export function authRouter(): Router {
  router.post('/sign-up', signUp);
  router.post('/sign-in', signIn);
  router.put('/verify-email', verifyEmail);
  router.put('/verify-otp/:otp', verifyOTP);
  router.put('/forget-password', forgetPassword);
  router.post('/reset-password/:token', resetPassword);
  router.put('/change-password', changePassword);
  return router;
}
