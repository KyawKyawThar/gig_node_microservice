import { signUp } from '@auth/controller/signup';
import express, { Router } from 'express';

const router: Router = express.Router();

export function authRouter(): Router {
  router.post('/sign-up', signUp);

  return router;
}
