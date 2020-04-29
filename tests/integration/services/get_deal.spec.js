import faker from 'faker';

import GetDeal from '../../../src/app/services/GetDeal';
import { axios } from '../../../mocks/axios';
import { pipedrive_api_url } from '../../../src/config/pipedrive';

describe('GetDeal service', () => {
  it('should be able to get Pipedrive response error', async () => {
    const id = faker.random.number();

    axios
      .setBaseUrl(pipedrive_api_url)
      .onGet(`/deals/${id}`)
      .reply(401, 'Unauthorized');

    GetDeal.run({ id }).catch(err => {
      expect({ ...err }).toStrictEqual({
        data: {
          code: 531,
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
              'An error occurred while trying to retrieve the deal from Pipedrive',
            statusCode: 503,
          },
          statusCode: 503,
        },
      });
    });
  });
});
