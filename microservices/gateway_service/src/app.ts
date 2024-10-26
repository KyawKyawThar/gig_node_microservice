import express, { Express } from 'express';
import { GateWayService } from '@gateway/server';
import { redisConnection } from '@gateway/redis/redis.connection';

class Application {
  public initialized(): void {
    const app: Express = express();

    const gatewayServer: GateWayService = new GateWayService(app);
    gatewayServer.start();
    redisConnection.createRedisConnection();
  }
}

const app: Application = new Application();
app.initialized();
