import { HealthController } from '@gateway/controller/health';
import express, { Router } from 'express';

class HealthRouter {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/gateway-health', HealthController.prototype.health);
    return this.router;
  }
}

export const healthRoute: HealthRouter = new HealthRouter();
