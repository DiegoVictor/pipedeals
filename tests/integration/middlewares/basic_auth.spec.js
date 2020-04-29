import faker from 'faker';
import jwt from 'jsonwebtoken';

import BasicAuth from '../../../src/app/middlewares/BasicAuth';

const res = {
  status: jest.fn(() => res),
  json: jest.fn(response => response),
};

describe('BasicAuth middleware', () => {
  it('should not be able to request without a token', async () => {
    const req = { headers: {} };

    try {
      BasicAuth(req, res, jest.fn());
    } catch (err) {
      expect({ ...err }).toStrictEqual({
        data: { code: 640 },
        isBoom: true,
        isServer: false,
        output: {
          statusCode: 400,
          payload: {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Missing authorization',
          },
          headers: {},
        },
      });
    }
  });

  it('should not be able to request with a invalid token', async () => {
    const req = {
      headers: {
        authorization: `Bearer ${jwt.sign({ id: faker.random.number() }, '7d', {
          expiresIn: '-1d',
        })}`,
      },
    };

    try {
      BasicAuth(req, res, jest.fn());
    } catch (err) {
      const message = 'You are not authorized!';
      expect({ ...err }).toStrictEqual({
        data: null,
        isBoom: true,
        isServer: false,
        output: {
          statusCode: 401,
          payload: {
            attributes: {
              code: 641,
              error: message,
            },
            statusCode: 401,
            error: 'Unauthorized',
            message,
          },
          headers: {
            'WWW-Authenticate': `sample code="641", error="${message}"`,
          },
        },
      });
    }
  });
});
