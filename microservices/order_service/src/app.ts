import express, { Express } from 'express';
import { databaseConnection } from '@order/database';
import { start } from '@order/server';

const initialize = async () => {
  const app: Express = express();

  databaseConnection();
  start(app);
};

initialize();
