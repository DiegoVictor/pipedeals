import 'dotenv/config';
import faker from 'faker';
import btoa from 'btoa';

import PipedriveAuth from '../../../src/app/middlewares/PipedriveAuth';

describe('Pipedrive Auth', () => {
  it('should not be able to request without user and password', async () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(response => response),
    };

    const response = await PipedriveAuth(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(response).toStrictEqual({
      error: {
        message: 'Missing authorization',
      },
    });
  });

  it('should not be able to request with wrong user', async () => {
    const req = {
      headers: {
        authorization: `Basic ${btoa(
          `${faker.random.alphaNumeric(16)}:${process.env.PIPEDRIVE_PWD}`
        )}`,
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(response => response),
    };

    const response = await PipedriveAuth(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(response).toStrictEqual({
      error: {
        message: 'You are not authorized!',
      },
    });
  });

  it('should not be able to request with wrong password', async () => {
    const req = {
      headers: {
        authorization: `Basic ${btoa(
          `${process.env.PIPEDRIVE_USER}:${faker.random.alphaNumeric(32)}`
        )}`,
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(response => response),
    };

    const response = await PipedriveAuth(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(response).toStrictEqual({
      error: {
        message: 'You are not authorized!',
      },
    });
  });

  it('should be able to request with user and password', async () => {
    const req = {
      headers: {
        authorization: `Basic ${btoa(
          `${process.env.PIPEDRIVE_USER}:${process.env.PIPEDRIVE_PWD}`
        )}`,
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(response => response),
    };
    const next = jest.fn();

    await PipedriveAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
