import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { badRequest, notFound } from '@hapi/boom';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw notFound('User not exists', { code: 344 });
    }

    if (!(await bcryptjs.compare(password, user.password))) {
      throw badRequest('User and/or password not match', { code: 340 });
    }

    return res.json({
      user: { _id: user._id, email: user.email, name: user.name },
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
      }),
    });
  }
}

export default new SessionController();
