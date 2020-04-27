import { serverUnavailable } from '@hapi/boom';
import axios from 'axios';

import { pipedrive_api_url } from '../../config/pipedrive';

class GetDealProducts {
  async run({ id }) {
    try {
      const items = [];
      const { data: products } = await axios.get(
        `${pipedrive_api_url}/deals/${id}/products`,
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

      return items;
    } catch ({ response: { status, statusText, data } }) {
      throw serverUnavailable(
        "An error occurred while trying to retrieve the deal's products from Pipedrive",
        {
          code: 533,
          details: {
            status,
            statusText,
          },
        }
      );
    }
  }
}

export default new GetDealProducts();
