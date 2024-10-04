import { Logger } from 'winston';
import { winstonLogger } from '@gig/logger';
import { config } from './config';
import { Channel } from 'amqplib';
import { Application } from 'express';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig-service', 'debug');

export let gigChannel: Channel;

export function start(app: Application) {}
