import { Router } from 'express';

import PipedriveEventController from '../app/controllers/PipedriveEventController';
import PipedriveEventValidator from '../app/validators/PipedriveEventValidator';

import basicAuth from '../app/middlewares/basicAuth';

const app = Router();

const pipedriveEventController = new PipedriveEventController();

app.post(
  '/events',
  basicAuth,
  PipedriveEventValidator,
  pipedriveEventController.store
);

export default app;
