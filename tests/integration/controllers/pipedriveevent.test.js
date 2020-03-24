import * as Sentry from '@sentry/node';
import request from 'supertest';
import Mongoose from 'mongoose';
import MockAdapter from 'axios-mock-adapter';
import btoa from 'btoa';

import app from '../../../src/app';
import factory from '../../utils/factory';
import Pipedrive from '../../../src/app/services/Pipedrive';
import Report from '../../../src/app/models/Report';
import Bling from '../../../src/app/services/Bling';

const pipedrive_api_mock = new MockAdapter(Pipedrive);
const bling_api_mock = new MockAdapter(Bling);

jest.mock('@sentry/node');

describe('PipedriveEvent', () => {
  beforeEach(async () => {
    await Report.deleteMany();
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to save an opportunity', async () => {
    const product = await factory.attrs('Product');
    const deal = await factory.attrs('Deal');

    pipedrive_api_mock
      .onGet(`/deals/${deal.id}`)
      .reply(200, { data: deal })
      .onGet(`/deals/${deal.id}/products`)
      .reply(200, { data: [product] })
      .onGet('dealFields')
      .reply(200, {
        data: [
          {
            key: '6427f011f186d62449eb8caf53edb2a52cf959a4',
            name: 'Parcels',
            field_type: 'double',
            edit_flag: true,
          },
          {
            key: '4275aa493fbf4aeeefb0d918cd90df6273655368',
            name: 'Payment Method',
            field_type: 'enum',
            edit_flag: true,
            options: [
              {
                label: 'Boleto',
                id: 12,
              },
              {
                label: 'Dinheiro',
                id: 26,
              },
            ],
          },
          {
            key: '6866136a4bc7b12a75897df3d7ae168b46497b10',
            name: 'Supplier',
            field_type: 'varchar',
            edit_flag: true,
          },
        ],
      });

    bling_api_mock.onPost('/pedidocompra/json').reply(200);

    const { body } = await request(app)
      .post('/v1/pipedrive/events')
      .set(
        'Authorization',
        `Basic ${btoa(
          `${process.env.PIPEDRIVE_USER}:${process.env.PIPEDRIVE_PWD}`
        )}`
      )
      .send({
        event: 'updated.deal',
        current: {
          id: deal.id,
          status: 'won',
        },
      });

    expect(body).toStrictEqual({ status: 'success' });
  });

  it('should not be able to save an opportunity', async () => {
    const deal = await factory.attrs('Deal');
    Sentry.captureException = jest.fn();

    pipedrive_api_mock.onGet(`/deals/${deal.id}`).reply(400);

    const { body } = await request(app)
      .post('/v1/pipedrive/events')
      .set(
        'Authorization',
        `Basic ${btoa(
          `${process.env.PIPEDRIVE_USER}:${process.env.PIPEDRIVE_PWD}`
        )}`
      )
      .expect(400)
      .send({
        event: 'updated.deal',
        current: {
          id: deal.id,
          status: 'won',
        },
      });

    expect(Sentry.captureException).toHaveBeenCalled();
    expect(body).toStrictEqual({
      status: 'fail',
      error: {
        message: expect.any(String),
      },
    });
  });
});
