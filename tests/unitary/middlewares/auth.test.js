import 'dotenv/config';
import faker from 'faker';
import jwt from 'jsonwebtoken';

import Auth from '../../../src/app/middlewares/Auth';

const res = {
  status: jest.fn(() => res),
  json: jest.fn(response => response),
};

describe('Auth middleware', () => {
  it('should not be able to request without a token', async () => {
    const req = { headers: {} };
    const response = await Auth(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(response).toStrictEqual({
      error: {
        message: 'Missing authorization token',
      },
    });
  });

  it('should not be able to request with a invalid token', async () => {
    const req = {
      headers: {
        authorization: `Bearer ${jwt.sign(
          { id: faker.random.number() },
          process.env.JWT_SECRET,
          {
            expiresIn: '-1d',
          }
        )}`,
      },
    };

    const response = await Auth(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(response).toStrictEqual({
      error: {
        message: 'Token expired or invalid',
      },
    });
  });
});
