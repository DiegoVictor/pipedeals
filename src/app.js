import 'dotenv/config';
import Express from 'express';
import Mongoose from 'mongoose';
import * as Sentry from '@sentry/node';

import routes from './routes';

Mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const App = Express();
App.use(Express.json());

App.use('/v1/', routes);

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  App.use(Sentry.Handlers.requestHandler());
}

export default App;
