import faker from 'faker';

import GetDealProducts from '../../../src/app/services/GetDealProducts';
import { axios } from '../../../mocks/axios';
import { pipedriveApiUrl } from '../../../src/config/pipedrive';

describe('GetDealProducts', () => {
  it('should be able to get Pipedrive response error', () => {
    const id = faker.datatype.number();

    axios
      .setBaseUrl(pipedriveApiUrl)
      .onGet(`/deals/${id}/products`)
      .reply(401, 'Unauthorized');

    const getDealProducts = new GetDealProducts();
    getDealProducts.run({ id }).catch((err) => {
      expect({ ...err }).toStrictEqual({
        data: {
          code: 533,
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
              "An error occurred while trying to retrieve the deal's products from Pipedrive",
            statusCode: 503,
          },
          statusCode: 503,
        },
      });
    });
  });
});
