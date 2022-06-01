import request from 'supertest';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

import app from '../../../src/app';
import User from '../../../src/app/models/User';
import factory from '../../utils/factory';

describe('Session', () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should be able to login', async () => {
    const { email, password } = await factory.attrs('User');
    const user = await User.create({ email, password });
    const response = await request(app)
      .post('/v1/sessions')
      .send({ email, password });

    expect(response.body).toMatchObject({
      user: { _id: user._id.toString(), email },
      token: expect.any(String),
    });
  });

  it('should not be able to login with user that not exists', async () => {
    const { email, password } = await factory.attrs('User');
    const response = await request(app)
      .post('/v1/sessions')
      .expect(400)
      .send({ email, password });

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'User not exists',
      code: 440,
      docs: process.env.DOCS_URL,
    });
  });

  it('should not be able to login', async () => {
    const wrong_password = faker.internet.password();
    const { name, email, password } = await factory.attrs('User');

    await User.create({ name, email, password });

    const response = await request(app)
      .post('/v1/sessions')
      .expect(400)
      .send({ email, password: wrong_password });

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      message: 'User and/or password not match',
      code: 450,
      docs: process.env.DOCS_URL,
    });
  });
});
