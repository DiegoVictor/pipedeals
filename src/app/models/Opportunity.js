import { model, Schema } from 'mongoose';
import rawurlencode from 'rawurlencode';
import * as Sentry from '@sentry/node';
import { endOfDay, startOfDay } from 'date-fns';

import Bling from '../services/Bling';
import payment_methods from '../../config/payment_methods';
import Report from './Report';

const Client = new Schema({
  pipedrive_id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Supplier = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const Item = new Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitary_value: {
    type: Number,
    required: true,
  },
});

const Parcel = new Schema({
  payment_term_in_days: {
    type: Number,
    required: true,
  },
  value: {
    type: Number,
    requred: true,
  },
});

const OpportunitySchema = new Schema(
  {
    client: Client,
    supplier: {
      type: Supplier,
      required: true,
    },
    items: [Item],
    parcels: [Parcel],
    payment_method: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const afterSave = async opportunity => {
  try {
    const { data: payment_methods } = await Bling.get('/formaspagamento/json', {
      params: { apikey: process.env.BLING_API_KEY },
    });
    const payment_method = payment_methods.retorno.formaspagamento.find(
      ({ formapagamento }) =>
        formapagamento.codigoFiscal ===
        payment_methods_map[opportunity.payment_method_id]
    );

    const start_of_day = startOfDay(new Date());
    const end_of_day = endOfDay(new Date());

    const report = await Report.findOne({
      date: { $gte: start_of_day, $lte: end_of_day },
    });

    if (report) {
      report.amount += opportunity.amount;
      await report.save();
    } else {
      await Report.create({
        date: new Date(),
        amount: opportunity.amount,
      });
    }

    await Bling.post(
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
                <idformapagamento>${payment_method.formapagamento.id}</idformapagamento>
              </parcela>`;
              })
              .join('')}
          </parcelas>
        </pedidocompra>`
      )}`
    );
  } catch (err) {
    Sentry.captureException(err);
  }
};

OpportunitySchema.post('save', afterSave);

export default model('Opportunity', OpportunitySchema);
