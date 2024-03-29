import { badRequest } from '@hapi/boom';

import User from '../models/User';

class UserController {
  async store(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw badRequest('Email already in use', { code: 140 });
    }
    await User.create({ email, password });

    return res.sendStatus(204);
  }
}

export default UserController;
