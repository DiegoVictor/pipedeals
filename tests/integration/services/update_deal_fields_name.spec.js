import faker from 'faker';

import UpdateDealFieldsName from '../../../src/app/services/UpdateDealFieldsName';
import { axios } from '../../../mocks/axios';
import { pipedrive_api_url } from '../../../src/config/pipedrive';

describe('UpdateDealFieldsName service', () => {
  it('should be able to get Pipedrive response error', async () => {
    const id = faker.random.number();

    axios
      .setBaseUrl(pipedrive_api_url)
      .onGet(`/dealFields`)
      .reply(401, 'Unauthorized');

    UpdateDealFieldsName.run({ id }).catch(err => {
      expect({ ...err }).toStrictEqual({
        data: {
          code: 532,
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
              "An error occurred while trying to retrieve the deal's fields from Pipedrive",
            statusCode: 503,
          },
          statusCode: 503,
        },
      });
    });
  });
});
