import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { gatewayCache } from '@gateway/redis/redis.cache';
import { Server, Socket } from 'socket.io';
import { io, Socket as SocketClient } from 'socket.io-client';
import { IMessageDocuments } from '@gateway/types/chatInterface';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

let chatSocketClient: SocketClient;
export class SocketIOAppHandler {
  private gateWayCache: typeof gatewayCache;
  private io: Server;
  //use with export class when constructor receives parameters
  constructor(io: Server) {
    this.io = io;
    this.gateWayCache = gatewayCache;
    this.checkSocketIOPrivateConnection();
  }

  public listen(): void {
    this.io.on('connection', async (socket: Socket) => {
      socket.on('category', async (category: string, username: string) => {
        this.gateWayCache.saveUserSelectedCategory(`selectedCategories:${username}`, category);
      });

      socket.on('loggedInUser', async (username: string) => {
        const response = await this.gateWayCache.saveLoggedInUserToCache('loggedInUser', username);
        this.io.emit('online', response);
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        const response = await this.gateWayCache.removeLoggedInUserFromCache('removeLoggedInUser', username);
        this.io.emit('online', response);
      });

      socket.on('getLoggedInUser', async () => {
        const response = await this.gateWayCache.getLoggedInUsersFromCache('getLoggedInUser');
        this.io.emit('online', response);
      });
    });
  }
  private checkSocketIOPrivateConnection(): void {
    chatSocketClient = io(config.MESSAGE_BASE_URL, {
      secure: true,
      transports: ['websocket', 'polling']
    });

    chatSocketClient.on('connect', () => {
      logger.info('Chat service socket connected');
    });

    chatSocketClient.on('disconnect', (error: SocketClient.DisconnectReason) => {
      logger.log('error', 'Chat socket disconnected error', error);
      chatSocketClient.connect();
    });

    chatSocketClient.on('connect_error', (error: Error) => {
      logger.log('error', 'Chat socket disconnected error', error);
      chatSocketClient.connect();
    });

    //custom events
    chatSocketClient.on('message received', (message: IMessageDocuments) => {
      logger.info('gateway sockets chatSocketClient received message', message);
      this.io.emit('message received', message);
    });
  }
}
