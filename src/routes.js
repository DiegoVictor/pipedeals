import { Router } from 'express';

import ReportController from './app/controllers/ReportController';
import PipedriveEventController from './app/controllers/PipedriveEventController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import ReportOppotunitiesController from './app/controllers/ReportOppotunitiesController';

import PipedriveEventStore from './app/validators/PipedriveEvent/Store';
import ReportGet from './app/validators/Report/Get';
import ReportShow from './app/validators/Report/Show';
import ReportOpportunityGet from './app/validators/ReportOpportunity/Get';
import ReportOpportunityShow from './app/validators/ReportOpportunity/Show';
import SessionStore from './app/validators/Session/Store';
import UserStore from './app/validators/User/Store';

import BasicAuth from './app/middlewares/BasicAuth';
import BearerAuth from './app/middlewares/BearerAuth';
import RateLimit from './app/middlewares/RateLimit';

import { BruteForce } from './database/redis';
import bruteforce_config from './config/bruteforce';

const Route = Router();

Route.post(
  '/sessions',
  new BruteForce(bruteforce_config).prevent,
  SessionStore,
  SessionController.store
);

Route.use(RateLimit);

Route.post('/users', UserStore, UserController.store);

Route.post(
  '/pipedrive/events',
  BasicAuth,
  PipedriveEventStore,
  PipedriveEventController.store
);

Route.use(BearerAuth);

Route.get('/reports', ReportGet, ReportController.index);
Route.get('/reports/:id', ReportShow, ReportController.show);

Route.get(
  '/reports/:report_id/opportunities',
  ReportOpportunityGet,
  ReportOppotunitiesController.index
);
Route.get(
  '/reports/:report_id/opportunities/:id',
  ReportOpportunityShow,
  ReportOppotunitiesController.show
);

export default Route;
