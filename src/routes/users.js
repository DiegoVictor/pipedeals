import { Router } from 'express';

import UserController from '../app/controllers/UserController';
import EmailAndPasswordValidator from '../app/validators/EmailAndPasswordValidator';

const app = Router();

const userController = new UserController();

app.post('/', EmailAndPasswordValidator, userController.store);

export default app;
