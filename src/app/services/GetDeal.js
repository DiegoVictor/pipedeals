import { serverUnavailable } from '@hapi/boom';
import axios from 'axios';

import { pipedrive_api_url } from '../../config/pipedrive';

class GetDeal {
  async run({ id }) {
    try {
      const { data: deal } = await axios.get(
        `${pipedrive_api_url}/deals/${id}`,
        {
          params: {
            api_token: process.env.PIPEDRIVE_API_TOKEN,
          },
        }
      );

      return deal.data;
    } catch ({ response: { status, statusText }, message }) {
      throw serverUnavailable(
        'An error occurred while trying to retrieve the deal from Pipedrive',
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

export default new GetDeal();
