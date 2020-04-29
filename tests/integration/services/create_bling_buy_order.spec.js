import faker from 'faker';
import rawurlencode from 'rawurlencode';

import factory from '../../utils/factory';
import CreateBlingBuyOrder from '../../../src/app/services/CreateBlingBuyOrder';
import { axios } from '../../../mocks/axios';

describe('CreateBlingBuyOrder service', () => {
  it('should be able to get create a new opportunity with new payment method', async () => {
    const opportunity = await factory.attrs('Opportunity');
    const id = faker.random.number();

    process.env.BLING_API_KEY = faker.random.alphaNumeric(16);

    axios
      .onGet('/formaspagamento/json')
      .reply(200, {
        retorno: {
          formaspagamento: [
            {
              formapagamento: {
                id: faker.random.number(),
                descricao: faker.random.word(),
              },
            },
          ],
        },
      })
      .onPost('/formapagamento/json')
      .reply(200, {
        retorno: {
          formaspagamento: [{ id, descricao: opportunity.payment_method }],
        },
      })
      .onPost('/pedidocompra/json')
      .reply(200);

    await CreateBlingBuyOrder.run({ opportunity });

    expect(axios.sent['/pedidocompra/json']).toBe(
      `apikey=${process.env.BLING_API_KEY}&xml=${rawurlencode(
        `<?xml version="1.0" encoding="UTF-8"?>
        <pedidocompra>
          <fornecedor>
            <nome>${opportunity.supplier.name}</nome>
          </fornecedor>
          <itens>
          ${opportunity.items.map(item => {
            return `<item>
              <descricao>${item.description}</descricao>
              <qtde>${item.quantity}</qtde>
              <valor>${item.unitary_value}</valor>
            </item>`;
          })}
          </itens>
          <parcelas>
            ${opportunity.parcels
              .map(parcel => {
                return `<parcela>
                <nrodias>${parcel.payment_term_in_days}</nrodias>
                <valor>${parcel.value}</valor>
                <idformapagamento>${id}</idformapagamento>
              </parcela>`;
              })
              .join('')}
          </parcelas>
        </pedidocompra>`.replace(/>\s+</gi, '><')
      )}`
    );
  });

  it('should be able to get Bling response error', async () => {
    const opportunity = await factory.attrs('Opportunity');

    axios.onGet('/formaspagamento/json').reply(401, 'Unauthorized');

    CreateBlingBuyOrder.run({ opportunity }).catch(err => {
      expect({ ...err }).toStrictEqual({
        data: {
          code: 534,
          details: {
            status: 401,
            statusText: 'Unauthorized',
          },
        },
        isBoom: true,
        isServer: true,
        output: {
          headers: {},
          payload: {
            error: 'Service Unavailable',
            message:
              'An error occurred while trying to save the order at Bling',
            statusCode: 503,
          },
          statusCode: 503,
        },
      });
    });
  });
});
