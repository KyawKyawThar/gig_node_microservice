import { Application } from 'express';
import { config } from './config';
import { healthRouter } from './router/health';
import {messageRouter} from "@chats/router/message";
import {verifyChatGatewayRequest} from "@chats/chatMiddleware";

export function appRoutes(app: Application) {
  app.use(config.CHATS_BASE_PATH, healthRouter());
  app.use(config.CHATS_BASE_PATH,verifyChatGatewayRequest,messageRouter())
}
