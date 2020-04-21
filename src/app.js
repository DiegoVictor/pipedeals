import 'dotenv/config';
import 'express-async-errors';

import Express from 'express';
import Mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { isBoom } from '@hapi/boom';
import { errors } from 'celebrate';

import routes from './routes';
import ResourceRoute from './app/middlewares/ResourceRoute';

Mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const App = Express();

App.use(helmet());
App.use(cors());
App.use(Express.json());
App.use(ResourceRoute);

App.use('/v1/', routes);

App.use(errors());
App.use((err, _, res, next) => {
  if (isBoom(err)) {
    const { statusCode, payload } = err.output;

    return res.status(statusCode).json({
      ...payload,
      ...err.data,
      docs: process.env.DOCS_URL,
    });
}

  return next(err);
});

export default App;
