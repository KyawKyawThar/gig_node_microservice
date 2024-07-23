import express, { Express } from 'express';
import { GateWayService } from '@gateway/server';

class Application {
  public initialized(): void {
    const app: Express = express();

    const gatewayServer: GateWayService = new GateWayService(app);
    gatewayServer.start();
  }
}

const app: Application = new Application();
app.initialized();
