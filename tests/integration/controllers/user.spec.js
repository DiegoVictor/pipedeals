import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../../src/app';
import User from '../../../src/app/models/User';
import factory from '../../utils/factory';

describe('User controller', () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should be able to store a new user', async () => {
    const { email, password } = await factory.attrs('User');
    const response = await request(app)
      .post('/v1/users')
      .expect(204)
      .send({ email, password });

    expect(response.body).toStrictEqual({});
  });

  it('should not be able to store a new user with a duplicated email', async () => {
    const [{ email }, { password }] = await factory.createMany('User', 2);
    const response = await request(app)
      .post('/v1/users')
      .expect(400)
      .send({ email, password });

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Email already in use',
      code: 140,
      docs: process.env.DOCS_URL,
    });
  });
});
