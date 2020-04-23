import { model, Schema } from 'mongoose';
import { endOfDay, startOfDay } from 'date-fns';

import Report from './Report';

const Client = new Schema({
  pipedrive_id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Supplier = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const Item = new Schema({
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitary_value: {
    type: Number,
    required: true,
  },
});

const Parcel = new Schema({
  payment_term_in_days: {
    type: Number,
    required: true,
  },
  value: {
    type: Number,
    requred: true,
  },
});

const OpportunitySchema = new Schema(
  {
    report_id: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
    },
    client: Client,
    supplier: {
      type: Supplier,
      required: true,
    },
    items: [Item],
    parcels: [Parcel],
    payment_method: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export async function beforeSave(next) {
  const report = await Report.findOne({
    date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
  });

  if (!report) {
    this.set({
      report_id: await Report.create({
        date: new Date(),
        amount: this.amount,
      }),
    });
  } else {
    this.set({ report_id: report._id });

    report.amount += this.amount;
    await report.save();
  }
  next();
}

OpportunitySchema.pre('save', beforeSave);

export default model('Opportunity', OpportunitySchema);
