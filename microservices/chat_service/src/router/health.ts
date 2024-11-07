import { chatHealthCheck } from '@chats/controller/health';
import express, { Router } from 'express';

const router = express.Router();

export function healthRouter(): Router {
  router.get('/chat-health', chatHealthCheck);
  return router;
}
