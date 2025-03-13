import { currentUser, resendEmail } from '@auth/controller/currentUser';
import { refreshToken } from '@auth/controller/refreshToken';
import express, { Router } from 'express';

const router: Router = express.Router();

export function currentUserRouter() {
  router.get('/current-user', currentUser);
  router.get('/refresh-token/', refreshToken);
  router.post('/resend-email', resendEmail);
  return router;
}
