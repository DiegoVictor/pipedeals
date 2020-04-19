import { Router } from 'express';

import ReportController from './app/controllers/ReportController';
import PipedriveEventController from './app/controllers/PipedriveEventController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import ReportOppotunitiesController from './app/controllers/ReportOppotunitiesController';

import PipedriveStore from './app/validators/Pipedrive/Store';
import ReportGet from './app/validators/Report/Get';
import SessionStore from './app/validators/Session/Store';
import UserStore from './app/validators/User/Store';

import PipedriveAuth from './app/middlewares/PipedriveAuth';

const Route = Router();

Route.post('/sessions', SessionStore, SessionController.store);
Route.post('/users', UserStore, UserController.store);

Route.post(
  '/pipedrive/events',
  PipedriveAuth,
  PipedriveStore,
  PipedriveEventController.store
);

Route.use(Auth);

Route.get('/reports', ReportGet, ReportController.index);
Route.get('/reports/:id', ReportController.show);

Route.get(
  '/reports/:report_id/opportunities',
  ReportOppotunitiesController.index
);

Route.get(
  '/reports/:report_id/opportunities/:id',
  ReportOppotunitiesController.show
);

export default Route;
