import { createMessage } from '@chats/controller/create';
import { conversation, conversationList, messages, userMessages } from '@chats/controller/get';
import { markMultipleMessages, markSingleMessage, offer } from '@chats/controller/update';
import express, { Router } from 'express';

const router = express.Router();

export function messageRouter(): Router {
  router.get('/:senderUsername/:receiverUsername', messages);
  router.post('/', createMessage);
  router.get('/conversation/:senderUsername/:receiverUsername', conversation);
  router.get('/:conversationId', userMessages);
  router.get('/conversations/list/:username', conversationList);
  router.put('/mark-multiple-as-read', markMultipleMessages);
  router.put('/mark-as-read', markSingleMessage);

  router.put('/offer', offer);

  return router;
}
