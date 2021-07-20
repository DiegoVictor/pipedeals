import { serverUnavailable } from '@hapi/boom';
import axios from 'axios';

import { pipedriveApiUrl } from '../../config/pipedrive';

class GetDealProducts {
  async run({ id }) {
    try {
      const items = [];
      const { data: products } = await axios.get(
        `${pipedriveApiUrl}/deals/${id}/products`,
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
    } catch ({ response: { status, statusText } }) {
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
