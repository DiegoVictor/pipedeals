import request from 'supertest';
import Mongoose from 'mongoose';
import btoa from 'btoa';
import faker from 'faker';

import app from '../../../src/app';
import Report from '../../../src/app/models/Report';
import factory from '../../utils/factory';
import Opportunity from '../../../src/app/models/Opportunity';
import { axios } from '../../../mocks/axios';
import { pipedrive_api_url } from '../../../src/config/pipedrive';

describe('PipedriveEvent controller', () => {
  const payment_method = faker.random.word();
  const payment_method_id = faker.random.number();

  beforeEach(async () => {
    await Report.deleteMany();
    await Opportunity.deleteMany();
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to save an opportunity', async () => {
    const product = await factory.attrs('Product');
    const deal = await factory.attrs('Deal', {
      payment_method: payment_method_id,
    });

    axios
      .setBaseUrl(pipedrive_api_url)
      .onGet(`/deals/${deal.id}`)
      .reply(200, { data: { ...deal } })
      .onGet('/dealFields')
      .reply(200, {
        data: [
          {
            key: 'parcels',
            name: 'Parcels',
            field_type: 'double',
            edit_flag: true,
          },
          {
            key: 'payment_method',
            name: 'Payment Method',
            field_type: 'enum',
            edit_flag: true,
            options: [
              {
                label: payment_method,
                id: payment_method_id,
              },
            ],
          },
          {
            key: 'supplier',
            name: 'Supplier',
            field_type: 'varchar',
            edit_flag: true,
          },
        ],
      })
      .onGet(`/deals/${deal.id}/products`)
      .reply(200, { data: [product] })
      .onGet('/formaspagamento/json')
      .reply(200, {
        retorno: {
          formaspagamento: [
            {
              formapagamento: {
                id: payment_method_id,
                descricao: payment_method,
              },
            },
          ],
        },
      })
      .onPost('/pedidocompra/json')
      .reply(200);

    const response = await request(app)
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

    const amount = product.item_price * product.quantity;
    const rest = parseFloat(Number(amount % deal.parcels).toFixed(2));

    const parcels = [];
    for (let i = 1; i <= deal.parcels; i += 1) {
      parcels.push({
        payment_term_in_days: i * 30,
        value: (amount - rest) / deal.parcels,
      });
    }

    parcels[0].value += rest;

    expect(response.body).toStrictEqual({ status: 'success' });
    expect(await Opportunity.findOne().lean()).toMatchObject({
      client: {
        pipedrive_id: deal.id,
        name: deal.person_id.name,
      },
      supplier: {
        name: deal.supplier,
      },
      items: [
        {
          quantity: product.quantity,
          description: product.name,
          unitary_value: parseFloat(product.item_price),
        },
      ],
      parcels,
      payment_method,
      amount,
    });
  });
});
