import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../../src/app';
import Opportunity from '../../../src/app/models/Opportunity';
import Report from '../../../src/app/models/Report';
import User from '../../../src/app/models/User';
import factory from '../../utils/factory';
import jwtoken from '../../utils/jwtoken';

describe('ReportOpportunities', () => {
  const url = `http://127.0.0.1:${process.env.APP_PORT}/v1`;

  beforeEach(async () => {
    await User.deleteMany();
    await Report.deleteMany();
    await Opportunity.deleteMany();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should be able to get a list of opportunities', async () => {
    const { _id: report_id } = await factory.create('Report', {
      date: new Date(),
    });
    const opportunities = await factory.createMany('Opportunity', 10, {
      report_id,
    });

    const { _id: user_id } = await factory.create('User');
    const token = jwtoken(user_id);

    const response = await request(app)
      .get(`/v1/reports/${report_id}/opportunities`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.body.length).toBeLessThanOrEqual(30);

    opportunities.forEach((opportunity) => {
      expect(response.body).toContainEqual({
        _id: opportunity._id.toString(),
        amount: opportunity.amount,
        supplier: {
          name: opportunity.supplier.name,
        },
        client: {
          name: opportunity.client.name,
          pipedrive_id: opportunity.client.pipedrive_id,
        },
        payment_method: opportunity.payment_method,
        parcels: [
          ...opportunity.parcels.map(({ payment_term_in_days, value }) => ({
            payment_term_in_days,
            value,
          })),
        ],
        items: [
          ...opportunity.items.map(
            ({ description, quantity, unitary_value }) => ({
              description,
              quantity,
              unitary_value,
            })
          ),
        ],
        report_url: `${url}/reports/${report_id}`,
        url: `${url}/reports/${report_id}/opportunities/${opportunity._id}`,
      });
    });
  });

  it('should be able to get the second page of opportunities', async () => {
    const { _id: report_id } = await factory.create('Report', {
      date: new Date(),
    });
    let opportunities = await factory.createMany('Opportunity', 20, {
      report_id,
    });

    const { _id: user_id } = await factory.create('User');
    const token = jwtoken(user_id);

    const response = await request(app)
      .get(`/v1/reports/${report_id}/opportunities?page=2`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.body.length).toBeLessThanOrEqual(30);

    opportunities = opportunities.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return -1;
      }
      if (a === b) {
        return 0;
      }

      return 1;
    });

    opportunities.slice(-10).forEach((opportunity) => {
      expect(response.body).toContainEqual({
        _id: opportunity._id.toString(),
        amount: opportunity.amount,
        supplier: {
          name: opportunity.supplier.name,
        },
        client: {
          name: opportunity.client.name,
          pipedrive_id: opportunity.client.pipedrive_id,
        },
        payment_method: opportunity.payment_method,
        parcels: [
          ...opportunity.parcels.map(({ payment_term_in_days, value }) => ({
            payment_term_in_days,
            value,
          })),
        ],
        items: [
          ...opportunity.items.map(
            ({ description, quantity, unitary_value }) => ({
              description,
              quantity,
              unitary_value,
            })
          ),
        ],
        report_url: `${url}/reports/${report_id}`,
        url: `${url}/reports/${report_id}/opportunities/${opportunity._id}`,
      });
    });
  });

  it('should not be able to get opportunities of a report that not exists', async () => {
    const report = await factory.create('Report', {
      date: new Date(),
    });
    const { _id: user_id } = await factory.create('User');
    const token = jwtoken(user_id);

    await report.remove();

    const response = await request(app)
      .get(`/v1/reports/${report._id}/opportunities`)
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

  it('should be able to get an opportunity', async () => {
    const { _id: report_id } = await factory.create('Report', {
      date: new Date(),
    });
    const opportunity = await factory.create('Opportunity', { report_id });
    const { _id: user_id } = await factory.create('User');
    const token = jwtoken(user_id);

    const response = await request(app)
      .get(`/v1/reports/${report_id}/opportunities/${opportunity._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.body).toStrictEqual({
      _id: opportunity._id.toString(),
      amount: opportunity.amount,
      supplier: {
        name: opportunity.supplier.name,
      },
      client: {
        name: opportunity.client.name,
        pipedrive_id: opportunity.client.pipedrive_id,
      },
      items: [
        ...opportunity.items.map(
          ({ description, quantity, unitary_value }) => ({
            description,
            quantity,
            unitary_value,
          })
        ),
      ],
      parcels: [
        ...opportunity.parcels.map(({ payment_term_in_days, value }) => ({
          payment_term_in_days,
          value,
        })),
      ],
      payment_method: opportunity.payment_method,
      report_url: `${url}/reports/${report_id}`,
      url: `${url}/reports/${report_id}/opportunities/${opportunity._id}`,
    });
  });

  it('should not be able to get a opportunity that not exists', async () => {
    const { _id: report_id } = await factory.create('Report', {
      date: new Date(),
    });
    const opportunity = await factory.create('Opportunity', { report_id });
    const { _id: user_id } = await factory.create('User');
    const token = jwtoken(user_id);

    await opportunity.remove();

    const response = await request(app)
      .get(`/v1/reports/${report_id}/opportunities/${opportunity._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
      .send();

    expect(response.body).toStrictEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Opportunity not found',
      code: 344,
      docs: process.env.DOCS_URL,
    });
  });
});
