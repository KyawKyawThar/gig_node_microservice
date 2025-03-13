import express, { Express } from 'express';
import { start } from './server';
import { databaseConnection } from './database';
const initialize = () => {
  const app: Express = express();
  databaseConnection();
  start(app);
};

initialize();
