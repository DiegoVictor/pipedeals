import { model, Schema } from 'mongoose';
import bcryptjs from 'bcryptjs';

const User = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

User.pre('save', async function beforeSave(next) {
  if (this.isNew) {
    this.password = await bcryptjs.hash(this.password, 8);
  }
  next();
});

export default model('User', User);
