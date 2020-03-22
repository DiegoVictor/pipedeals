import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not exists',
        },
      });
    }

    if (!(await bcryptjs.compare(password, user.password))) {
      return res.status(400).json({
        error: {
          message: 'User and/or password not match',
        },
      });
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
