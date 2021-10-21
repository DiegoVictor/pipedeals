import 'dotenv/config';
import 'express-async-errors';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { isBoom } from '@hapi/boom';
import { errors } from 'celebrate';
import swagger from 'swagger-ui-express';

import swaggerDocument from './swagger.json';
import './database/mongodb';
import routes from './routes';
import routeAliases from './app/middlewares/routeAliases';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(routeAliases);

app.use('/docs', swagger.serve, swagger.setup(swaggerDocument));
app.use('/v1/', routes);

app.use(errors());
app.use((err, _, res, next) => {
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

export default app;
