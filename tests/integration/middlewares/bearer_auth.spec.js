import faker from 'faker';
import jwt from 'jsonwebtoken';

import BearerAuth from '../../../src/app/middlewares/BearerAuth';

describe('BearerAuth middleware', () => {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(response => response),
  };

  it('should not be able to request without a token', () => {
    const req = { headers: {} };
    BearerAuth(req, res, jest.fn()).catch(err => {
      expect({ ...err }).toStrictEqual({
        data: { code: 740 },
        isBoom: true,
        isServer: false,
        output: {
          statusCode: 400,
          payload: {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Missing authorization token',
          },
          headers: {},
        },
      });
    });
  });

  it('should not be able to request with a invalid token', async () => {
    const req = {
      headers: {
        authorization: `Bearer ${jwt.sign(
          { id: faker.random.number() },
          faker.random.alphaNumeric(29),
          {
            expiresIn: '-1d',
          }
        )}`,
      },
    };

    const message = 'Token expired or invalid';
    BearerAuth(req, res, jest.fn()).catch(err => {
      expect({ ...err }).toStrictEqual({
        data: null,
        isBoom: true,
        isServer: false,
        output: {
          statusCode: 401,
          payload: {
            attributes: {
              code: 741,
              error: message,
            },
            statusCode: 401,
            error: 'Unauthorized',
            message,
          },
          headers: {
            'WWW-Authenticate': `sample code="741", error="${message}"`,
          },
        },
      });
    });
  });
});
