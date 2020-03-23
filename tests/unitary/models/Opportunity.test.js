import 'dotenv/config';
import MockAdapter from 'axios-mock-adapter';
import Mongoose from 'mongoose';
import faker from 'faker';

import { startOfDay, endOfDay } from 'date-fns';
import factory from '../../utils/factory';
import { afterSave } from '../../../src/app/models/Opportunity';
import Bling from '../../../src/app/services/Bling';
import Report from '../../../src/app/models/Report';
import payment_methods_map from '../../../src/config/payment_methods';

const bling_api_mock = new MockAdapter(Bling);

describe('Opportunity model', () => {
  beforeAll(() => {
    Mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  });

  beforeEach(async () => {
    await Report.deleteMany();
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to send a new opportunity to bling', async () => {
    const payment = await factory.attrs('Payment', {
      retorno: {
        formaspagamento: [
          {
            formapagamento: {
              id: faker.random.number(),
              codigoFiscal: payment_methods_map[12],
            },
          },
        ],
      },
    });
    const opportunity = await factory.attrs('Opportunity', {
      payment_method_id: 12,
    });

    bling_api_mock
      .onGet('/formaspagamento/json', {
        params: { apikey: process.env.BLING_API_KEY },
      })
      .reply(200, payment)
      .onPost('/pedidocompra/json')
      .reply(200);

    await afterSave(opportunity);

    const report = await Report.findOne({
      amount: opportunity.amount,
      date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
    });

    expect(report).toMatchObject({
      amount: opportunity.amount,
      date: expect.any(Date),
    });
  });

  it('should be able to send a opportunity to bling and update the day report', async () => {
    const payment = await factory.attrs('Payment', {
      retorno: {
        formaspagamento: [
          {
            formapagamento: {
              id: faker.random.number(),
              codigoFiscal: payment_methods_map[12],
            },
          },
        ],
      },
    });
    const opportunity = await factory.attrs('Opportunity', {
      payment_method_id: 12,
    });

    let report = await factory.create('Report', {
      date: new Date(),
      amount: 0,
    });

    bling_api_mock
      .onGet('/formaspagamento/json', {
        params: { apikey: process.env.BLING_API_KEY },
      })
      .reply(200, payment)
      .onPost('/pedidocompra/json')
      .reply(200);

    await afterSave(opportunity);

    report = await Report.findById(report._id);

    expect(report).toMatchObject({
      amount: opportunity.amount,
    });
  });
});
