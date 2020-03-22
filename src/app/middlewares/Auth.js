import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export default async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json({
      error: {
        message: 'Missing authorization token',
      },
    });
  }

  const [, token] = authorization.split(' ');

  try {
    const { id } = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user_id = id;
  } catch (err) {
    return res.status(401).json({
      error: {
        message: 'Token expired or invalid',
      },
    });
  }

  return next();
};
