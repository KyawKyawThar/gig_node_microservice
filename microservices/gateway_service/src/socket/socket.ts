import { gatewayCache } from '@gateway/redis/redis.cache';
import { Server, Socket } from 'socket.io';

import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { io, Socket as SocketClient } from 'socket.io-client';
import { IMessageDocuments } from '@gateway/types/chatInterface';
import { IOrderDocument, IOrderNotification } from '@gateway/types/orderInterface';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

let chatSocketClient: SocketClient;
export class SocketIOAppHandler {
  private gateWayCache: typeof gatewayCache;
  private io: Server;
  //use with export class when constructor receives parameters
  constructor(io: Server) {
    this.io = io;
    this.gateWayCache = gatewayCache;
    // this.chatSocketIOPrivateConnection();
  }

  public listen(): void {
    this.chatSocketIOPrivateConnection();
    this.orderSocketPrivateConnection();
    this.io.on('connection', async (socket: Socket) => {
      socket.on('category', async (category: string, username: string) => {
        await this.gateWayCache.saveUserSelectedCategory(`selectedCategories:${username}`, category);
      });

      socket.on('getLoggedInUser', async () => {
        const response = await this.gateWayCache.getLoggedInUsersFromCache('loggedInUsers');
        this.io.emit('online', response);
      });

      socket.on('loggedInUsers', async (username: string) => {
        const response = await this.gateWayCache.saveLoggedInUserToCache('loggedInUsers', username);
        this.io.emit('online', response);
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        const response = await this.gateWayCache.removeLoggedInUserFromCache('loggedInUsers', username);
        this.io.emit('online', response);
      });
    });
  }
  private chatSocketIOPrivateConnection(): void {
    chatSocketClient = io(config.MESSAGE_BASE_URL, {
      secure: true,
      transports: ['websocket', 'polling']
    });

    chatSocketClient.on('connect', () => {
      console.log('socket connected chat service', chatSocketClient.id);
      logger.info('Chat service socket connected');
    });

    chatSocketClient.on('disconnect', (error: SocketClient.DisconnectReason) => {
      logger.log('error', 'ChatService socket disconnected error', error);
      chatSocketClient.connect();
    });

    chatSocketClient.on('connect_error', (error: Error) => {
      logger.log('error', 'ChatService socket disconnected error', error);
      chatSocketClient.connect();
    });

    //custom events
    chatSocketClient.on('message received', (message: IMessageDocuments) => {
      logger.info('gateway sockets chatSocketClient received message', message);
      this.io.emit('message received', message);
    });

    chatSocketClient.on('update message', (message: IMessageDocuments) => {
      logger.info('gateway sockets chatSocketClient received message', message);
      this.io.emit('update message', message);
    });
  }

  private orderSocketPrivateConnection(): void {
    const orderSocketClient = io(`${config.ORDER_BASE_URL}`, {
      transports: ['polling', 'websocket', 'webtransport'],
      secure: true
    });

    orderSocketClient.on('connect', () => {
      logger.info('Order service socket connected');
    });
    orderSocketClient.on('disconnect', (error: SocketClient.DisconnectReason) => {
      logger.log('error', 'OrderService socket disconnected error', error);
      orderSocketClient.connect();
    });
    orderSocketClient.on('connect_error', (error: Error) => {
      logger.log('error', 'Order Service socket disconnected error', error);
      orderSocketClient.connect();
    });

    // custom-socket
    orderSocketClient.on('order notification', (document: IOrderDocument, notification: IOrderNotification) => {
      logger.info('gateway sockets orderSocketClient received document', document, notification);
      this.io.emit('order notification', document, notification);
    });
  }
}
