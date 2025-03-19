import { Create } from '@gateway/controller/chats/create';
import { Get } from '@gateway/controller/chats/get';
import { Update } from '@gateway/controller/chats/update';
import { Router } from 'express';

class ChatRoute {
  private readonly router: Router;

  constructor() {
    this.router = Router();
  }

  public routes(): Router {
    this.router.post('/message', Create.prototype.createMessage);
    this.router.get('/message/:senderUsername/:receiverUsername', Get.prototype.getMessages);
    this.router.get('/message/conversation/:senderUsername/:receiverUsername', Get.prototype.getConversation);
    this.router.get('/message/:conversationId', Get.prototype.getUserMessage);
    this.router.get('/message/conversations/list/:username', Get.prototype.getConversationList);
    this.router.put('/message/mark-multiple-as-read', Update.prototype.markMultipleMessages);
    this.router.put('/message/mark-as-read', Update.prototype.markSingleMessage);

    this.router.put('/message/offer', Update.prototype.updateOffer);

    return this.router;
  }
}

export const chatRoute: ChatRoute = new ChatRoute();
