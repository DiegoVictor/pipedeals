import { Router } from 'express';

import ReportController from './app/controllers/ReportController';
import PipedriveEventController from './app/controllers/PipedriveEventController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import ReportOppotunitiesController from './app/controllers/ReportOppotunitiesController';

import PipedriveEventValidator from './app/validators/PipedriveEventValidator';
import EmailAndPasswordValidator from './app/validators/EmailAndPasswordValidator';
import PageValidator from './app/validators/PageValidator';
import IdValidator from './app/validators/IdValidator';
import ReportIdValidator from './app/validators/ReportIdValidator';

import BasicAuth from './app/middlewares/BasicAuth';
import BearerAuth from './app/middlewares/BearerAuth';
import RateLimit from './app/middlewares/RateLimit';

import { BruteForce } from './database/redis';
import config from './config/bruteforce';

const Route = Router();

Route.post(
  '/sessions',
  new BruteForce(config).prevent,
  EmailAndPasswordValidator,
  SessionController.store
);

Route.use(RateLimit);

Route.post('/users', EmailAndPasswordValidator, UserController.store);

Route.post(
  '/pipedrive/events',
  BasicAuth,
  PipedriveEventValidator,
  PipedriveEventController.store
);

Route.use(BearerAuth);

Route.get('/reports', PageValidator, ReportController.index);
Route.get('/reports/:id', IdValidator, ReportController.show);

Route.get(
  '/reports/:report_id/opportunities',
  PageValidator,
  ReportIdValidator,
  ReportOppotunitiesController.index
);
Route.get(
  '/reports/:report_id/opportunities/:id',
  IdValidator,
  ReportIdValidator,
  ReportOppotunitiesController.show
);

export default Route;
