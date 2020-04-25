import rawurlencode from 'rawurlencode';
import { serverUnavailable } from '@hapi/boom';
import axios from 'axios';

class CreateBlingBuyOrder {
  async run({ opportunity }) {
    try {
      const api = axios.create({
        baseURL: 'https://bling.com.br/Api/v2',
      });
      const { data: payment_methods } = await api.get('/formaspagamento/json', {
        params: { apikey: process.env.BLING_API_KEY },
      });

      let payment_method;
      payment_methods.retorno.formaspagamento.every(
        ({ formapagamento: { id, descricao } }) => {
          if (
            descricao.trim().toLowerCase() ===
            opportunity.payment_method.trim().toLowerCase()
          ) {
            payment_method = id;
            return false;
          }
          return true;
        }
      );

      if (!payment_method) {
        const { data } = await api.post(
          '/formapagamento/json',
          `apikey=${process.env.BLING_API_KEY}&xml=${rawurlencode(
            `<?xml version="1.0" encoding="UTF-8"?>
            <formapagamento>
              <descricao>${opportunity.payment_method}</descricao>
            </formapagamento>`
          )}`
        );

        payment_method = data.retorno.formaspagamento.pop().id;
      }

      await api.post(
        '/pedidocompra/json',
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
                  <idformapagamento>${payment_method}</idformapagamento>
                </parcela>`;
                })
                .join('')}
            </parcelas>
          </pedidocompra>`.replace(/>\s+/gi, '')
        )}`
      );
    } catch ({ response: { status, statusText, data } }) {
      throw serverUnavailable(
        'An error occurred while trying to save the order at Bling',
        {
          code: 531,
          details: {
            status,
            statusText,
          },
        }
      );
    }
  }
}

export default new CreateBlingBuyOrder();
