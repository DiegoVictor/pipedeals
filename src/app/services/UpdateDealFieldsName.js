import { serverUnavailable } from '@hapi/boom';
import slugify from 'slugify';
import axios from 'axios';

import { pipedrive_api_url } from '../../config/pipedrive';

class UpdateDealFieldsName {
  async run({ data: deal }) {
    try {
      const { data: fields } = await axios.get(
        `${pipedrive_api_url}/dealFields`,
        {
        params: { api_token: process.env.PIPEDRIVE_API_TOKEN },
        }
      );

      fields.data
        .filter(field => field.edit_flag)
        .forEach(field => {
          if (typeof deal[field.key] !== 'undefined') {
            let value = deal[field.key];
            if (field.field_type === 'enum') {
              value = field.options.find(
                option => option.id === parseInt(deal[field.key], 10)
              ).label;
            }
            deal[slugify(field.name.toLowerCase(), '_')] = value;
          }
        });

      return deal;
    } catch ({ response: { status, statusText, data } }) {
      throw serverUnavailable(
        `An error occurred while trying to retrieve the deal's fields from Pipedrive`,
        {
          code: 533,
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

export default new UpdateDealFieldsName();
