import request from 'supertest';
import Mongoose from 'mongoose';

import jwtoken from '../../utils/jwtoken';
import app from '../../../src/app';
import factory from '../../utils/factory';
import User from '../../../src/app/models/User';
import Report from '../../../src/app/models/Report';

describe('Report controller', () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Report.deleteMany();
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to get a list of days and amount', async () => {
    await factory.createMany('Report', 3);
    const { id } = await factory.create('User');
    const token = jwtoken(id);

    const { body } = await request(app)
      .get('/v1/reports')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(body.length).toBeLessThanOrEqual(30);
    expect([...body]).toContainEqual(
      expect.objectContaining({ _id: expect.any(String) })
    );
  });
});
