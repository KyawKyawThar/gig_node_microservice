import { currentUser } from '@gateway/controller/auth/currentUser';
import { refresh } from '@gateway/controller/auth/refreshToken';
import { authMiddleware } from '@gateway/services/auth-middleware';
import express, { Router } from 'express';

class CurrentUserRoute {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/auth/current-user', authMiddleware.checkAuthentication, currentUser.read);
    this.router.get('/auth/refresh-token/:username', authMiddleware.checkAuthentication, refresh.token);
    this.router.post('/auth/resend-email', authMiddleware.checkAuthentication, currentUser.resendEmail);

    return this.router;
  }
}

export const currentUserRoute = new CurrentUserRoute();