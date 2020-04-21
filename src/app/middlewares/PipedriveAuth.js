import atob from 'atob';
import { badRequest, unauthorized } from '@hapi/boom';

export default (req, _, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw badRequest('Missing authorization', { code: 640 });
  }

  const [user, pass] = atob(authorization.split(' ').pop()).split(':');

  if (
    user !== process.env.PIPEDRIVE_USER ||
    pass !== process.env.PIPEDRIVE_PWD
  ) {
    throw unauthorized('You are not authorized!', { code: 641 });
  }

  return next();
};
