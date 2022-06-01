import { faker } from '@faker-js/faker';

import UpdateDealFieldsName from '../../../src/app/services/UpdateDealFieldsName';
import { axios } from '../../../mocks/axios';
import { pipedriveApiUrl } from '../../../src/config/pipedrive';

describe('UpdateDealFieldsName', () => {
  it('should be able to get Pipedrive response error', async () => {
    const id = faker.datatype.number();

    axios
      .setBaseUrl(pipedriveApiUrl)
      .onGet(`/dealFields`)
      .reply(401, 'Unauthorized');

    const updateDealFieldsName = new UpdateDealFieldsName();
    updateDealFieldsName.run({ id }).catch((err) => {
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
              "An error occurred while trying to retrieve the deal's custom fields from Pipedrive",
            statusCode: 503,
          },
          statusCode: 503,
        },
      });
    });
  });
});
