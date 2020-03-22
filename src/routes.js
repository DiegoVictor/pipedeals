import { Router } from 'express';

import ReportController from './app/controllers/ReportController';
import PipedriveEventController from './app/controllers/PipedriveEventController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';

import Auth from './app/middlewares/Auth';
import PipedriveAuth from './app/middlewares/PipedriveAuth';

const Route = Router();

Route.post('/sessions', SessionController.store);
Route.post('/users', UserController.store);

Route.post('/pipedrive/events', PipedriveAuth, PipedriveEventController.store);

Route.use(Auth);

Route.get('/reports', ReportController.index);

export default Route;
