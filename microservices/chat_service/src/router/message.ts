import { createMessage } from '@chats/controller/create';
import { conversation, conversationList, messages, userMessages } from '@chats/controller/get';
import { markMultipleMessages, markSingleMessage, offer } from '@chats/controller/update';
import express, { Router } from 'express';

const router = express.Router();

export function messageRouter(): Router {
  router.get('/conversation/:senderUsername/:receiverUsername', conversation);
  router.get('/:senderUsername/:receiverUsername', messages);
  router.get('/conversations/:username', conversationList);
  router.get('/:conversationId', userMessages);
  router.post('/', createMessage);
  router.put('/offer', offer);
  router.put('/mark-as-read', markSingleMessage);
  router.put('/mark-multiple-as-read', markMultipleMessages);
  return router;
}
