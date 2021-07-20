import { Router } from 'express';

import SessionController from '../app/controllers/SessionController';
import EmailAndPasswordValidator from '../app/validators/EmailAndPasswordValidator';

const app = Router();

const sessionController = new SessionController();

app.post('/', EmailAndPasswordValidator, sessionController.store);

export default app;
