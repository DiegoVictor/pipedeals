import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../../src/app';
import User from '../../../src/app/models/User';
import Report from '../../../src/app/models/Report';
import factory from '../../utils/factory';
import jwtoken from '../../utils/jwtoken';

describe('Report', () => {
  const url = `http://127.0.0.1:${process.env.APP_PORT}/v1`;

  beforeEach(async () => {
    await User.deleteMany();
    await Report.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should be able to get a list of days and amount', async () => {
    const reports = await factory.createMany('Report', 15);
    const { _id: user_id } = await factory.create('User');
    const token = jwtoken(user_id);

    const response = await request(app)
      .get('/v1/reports')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.body.length).toBeLessThanOrEqual(30);

    reports
      .sort((a, b) => {
        if (a.date < b.date) {
          return -1;
        }
        if (a === b) {
          return 0;
        }

        return 1;
      })
      .slice(-10)
      .forEach(({ _id, amount, date }) => {
        expect(response.body).toContainEqual({
          _id: _id.toString(),
          amount,
          date: date.toISOString(),
          url: `${url}/reports/${_id}`,
          opportunities_url: `${url}/reports/${_id}/opportunities`,
        });
      });
  });

  it('should be able to get a report', async () => {
    const { _id, amount, date } = await factory.create('Report');
    const { _id: user_id } = await factory.create('User');
    const token = jwtoken(user_id);

    const response = await request(app)
      .get(`/v1/reports/${_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.body).toStrictEqual({
      _id: _id.toString(),
      amount,
      date: date.toISOString(),
      url: `${url}/reports/${_id}`,
      opportunities_url: `${url}/reports/${_id}/opportunities`,
    });
  });

  it('should not be able to get a report that not exists', async () => {
    const report = (await factory.create) < Report > 'Report';
    const { _id: user_id } = await factory.create('User');
    const token = jwtoken(user_id);

    await Report.findOneAndDelete(report._id);

    const response = await request(app)
      .get(`/v1/reports/${report._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .send();

    expect(response.body).toStrictEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Report not found',
      code: 244,
      docs: process.env.DOCS_URL,
    });
  });
});
