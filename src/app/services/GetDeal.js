import { serverUnavailable } from '@hapi/boom';

import Pipedrive from './Pipedrive';

class GetDeal {
  async run({ id }) {
    try {
      const { data: deal } = await Pipedrive.get(`/deals/${id}`, {
        params: {
          api_token: process.env.PIPEDRIVE_API_TOKEN,
        },
      });

      return deal.data;
    } catch ({ response: { status, statusText, data } }) {
      throw serverUnavailable(
        `An error occurred while trying to retrieve the deal from Pipedrive`,
        {
          code: 531,
          details: {
            status: {
              code: status,
              text: statusText,
            },
            ...data,
          },
        }
      );
    }
  }
}

export default new GetDeal();
