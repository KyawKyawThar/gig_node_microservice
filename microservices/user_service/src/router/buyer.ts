import express, { Router } from 'express';
import { getCurrentUsername, getEmail, getUsername } from '@user/controller/buyer/get';

const router = express.Router();

export function buyerRouter(): Router {
  router.get('/email', getEmail);
  router.get('/username', getCurrentUsername);
  router.get('/:username', getUsername);
  return router;
}
