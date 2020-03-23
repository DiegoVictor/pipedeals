import request from 'supertest';
import Mongoose from 'mongoose';

import app from '../../../src/app';
import User from '../../../src/app/models/User';
import factory from '../../utils/factory';

describe('User controller', () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to store a new user', async () => {
    const { email, password } = await factory.attrs('User');
    const { body } = await request(app)
      .post('/v1/users')
      .send({ email, password });

    expect(body).toMatchObject({ email });
  });

  it('should not be able to store a new user with a duplicated email', async () => {
    const [{ email }, { password }] = await factory.createMany('User', 2);
    const { body } = await request(app)
      .post('/v1/users')
      .expect(401)
      .send({ email, password });

    expect(body).toStrictEqual({
      error: {
        message: 'Email already in use',
      },
    });
  });
});
