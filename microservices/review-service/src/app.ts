import express, { Express } from 'express';
import { start } from '@review/server';
import { databaseConnection } from '@review/database';

const initialize = () => {
  const app: Express = express();
  databaseConnection();
  start(app);
};

initialize();
