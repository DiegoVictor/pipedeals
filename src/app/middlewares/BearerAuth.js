import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { badRequest, unauthorized } from '@hapi/boom';

export default async (req, _, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw badRequest('Missing authorization token', { code: 740 });
  }

  try {
    const [, token] = authorization.split(' ');
    const { id } = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user_id = id;

    return next();
  } catch (err) {
    throw unauthorized('Token expired or invalid', 'sample', { code: 741 });
  }
};
