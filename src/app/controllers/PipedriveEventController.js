import * as Sentry from '@sentry/node';

import slugify from 'slugify';
import Opportunity from '../models/Opportunity';
import Pipedrive from '../services/Pipedrive';

class PipedriveEventController {
  async store(req, res) {
    const { event, current } = req.body;

    switch (event) {
      case 'updated.deal': {
        if (current && current.status === 'won') {
          try {
            const { data: deal } = await Pipedrive.get(`/deals/${current.id}`, {
              params: {
                api_token: process.env.PIPEDRIVE_API_TOKEN,
              },
            });

            const { id, person_id } = deal.data;

            const items = [];
            const { data: products } = await Pipedrive.get(
              `/deals/${id}/products`,
              {
                params: { api_token: process.env.PIPEDRIVE_API_TOKEN },
              }
            );

            products.data.forEach(({ name, quantity, item_price }) => {
              items.push({
                quantity,
                description: name,
                unitary_value: item_price,
              });
            });

            const amount = items.reduce(
              (sum, item) => item.unitary_value * item.quantity + sum,
              0
            );

            const { data: fields } = await Pipedrive.get('dealFields', {
              params: { api_token: process.env.PIPEDRIVE_API_TOKEN },
            });

            fields.data
              .filter(field => field.edit_flag)
              .forEach(field => {
                if (typeof deal.data[field.key] !== 'undefined') {
                  let value = deal.data[field.key];
                  if (field.field_type === 'enum') {
                    value = field.options.find(
                      option => option.id === parseInt(deal.data[field.key], 10)
                    ).label;
                  }
                  deal.data[slugify(field.name.toLowerCase(), '_')] = value;
                }
              });

            const parcels = [];
            for (let i = 1; i <= deal.data.parcels; i += 1) {
              parcels.push({
                payment_term_in_days: 30 * i,
                value: amount / deal.data.parcels,
              });
            }

            await Opportunity.create({
              amount,
              supplier: {
                name: deal.data.supplier,
              },
              client: {
                pipedrive_id: id,
                name: person_id.name,
              },
              payment_method: deal.data.payment_method,
              parcels,
              items,
            });
          } catch (err) {
            Sentry.captureException(err);
            return res.status(400).json({
              status: 'fail',
              error: {
                message: err.message,
              },
            });
          }
        }
        break;
      }
    }

    return res.send({
      status: 'success',
    });
  }
}

export default new PipedriveEventController();
