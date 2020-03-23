import * as Sentry from '@sentry/node';
import request from 'supertest';
import Mongoose from 'mongoose';
import MockAdapter from 'axios-mock-adapter';
import btoa from 'btoa';
import faker from 'faker';

import app from '../../../src/app';
import factory from '../../utils/factory';
import Pipedrive from '../../../src/app/services/Pipedrive';
import Report from '../../../src/app/models/Report';
import payment_methods from '../../../src/config/payment_methods';
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
    const payment = {
      retorno: {
        formaspagamento: [
          {
            formapagamento: {
              id: faker.random.number(),
              codigoFiscal: payment_methods[deal.payment_method],
            },
          },
        ],
      },
    };

    pipedrive_api_mock
      .onGet(`/deals/${deal.id}`)
      .reply(200, { data: deal })
      .onGet(`/deals/${deal.id}/products`)
      .reply(200, { data: [product] });

    bling_api_mock
      .onGet('/formaspagamento/json', {
        params: { apikey: process.env.BLING_API_KEY },
      })
      .reply(200, payment)
      .onPost('/pedidocompra/json')
      .reply(200);

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
    Sentry.captureException = jest.fn();

    pipedrive_api_mock.onGet('deals').reply(400);

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
