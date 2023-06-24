import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';

import basicAuth from '../../../src/app/middlewares/basicAuth';

describe('basicAuth', () => {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn((response) => response),
  };

  it('should not be able to request without a token', async () => {
    const req = { headers: {} };

    try {
      basicAuth(req, res, jest.fn());
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
        authorization: `Bearer ${jwt.sign({ id: faker.number.int() }, '7d', {
          expiresIn: '-1d',
        })}`,
      },
    };

    try {
      basicAuth(req, res, jest.fn());
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
