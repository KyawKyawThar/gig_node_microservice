// import { Logger } from 'winston';
// import { winstonLogger } from '@gateway/logger';
// import { config } from '@gateway/config';
import { gatewayCache } from '@gateway/redis/redis.cache';
import { Server, Socket } from 'socket.io';

//const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

export class SocketIOAppHandler {
  private gateWayCache: typeof gatewayCache;
  private io: Server;
  //use with export class when constructor receives parameters
  constructor(io: Server) {
    this.io = io;
    this.gateWayCache = gatewayCache;
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
}
