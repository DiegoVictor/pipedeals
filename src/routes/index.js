import { Router } from 'express';

import pipedrive from './pipedrive';
import reports from './reports';
import sessions from './sessions';
import users from './users';

import bearerAuth from '../app/middlewares/bearerAuth';

const app = Router();

app.use('/sessions', sessions);
app.use('/users', users);
app.use('/pipedrive', pipedrive);

app.use(bearerAuth);

app.use('/reports', reports);

export default app;
