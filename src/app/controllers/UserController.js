import User from '../models/User';

class UserController {
  async store(req, res) {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        error: {
          message: 'Email already in use',
        },
      });
    }

    user = await User.create({ name, email, password });
    return res.json({ name, email });
  }
}

export default new UserController();
