import axios from 'axios';

export default axios.create({
  baseURL: `https://${process.env.PIPEDRIVE_DOMAIN_NAME}.pipedrive.com/v1`,
});
