import { faker } from '@faker-js/faker';

import GetDeal from '../../../src/app/services/GetDeal';
import { axios } from '../../../mocks/axios';
import { pipedriveApiUrl } from '../../../src/config/pipedrive';

describe('GetDeal', () => {
  it('should be able to get Pipedrive response error', async () => {
    const id = faker.datatype.number();

    axios
      .setBaseUrl(pipedriveApiUrl)
      .onGet(`/deals/${id}`)
      .reply(401, 'Unauthorized');

    const getDeal = new GetDeal();
    getDeal.run({ id }).catch((err) => {
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
