import 'dotenv/config';
import Express from 'express';
import Mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
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
}

export default App;
