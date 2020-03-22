import { model, Schema } from 'mongoose';

export default model(
  'Report',
  new Schema(
    {
      date: {
        type: Date,
        required: true,
        unique: true,
      },
      amount: {
        type: Number,
        default: 0,
      },
    },
    { timestamps: true }
  )
);
