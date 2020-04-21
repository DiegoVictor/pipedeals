import { model, Schema } from 'mongoose';
import { endOfDay, startOfDay } from 'date-fns';

import CreateBlingBuyOrder from '../services/CreateBlingBuyOrder';
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

export async function beforeSave(opportunity) {
  const report = await Report.findOne({
    date: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) },
  });

  if (!report) {
    this.set({
      report_id: await Report.create({
        date: new Date(),
        amount: opportunity.amount,
      }),
    });
  } else {
    this.set({ report_id: report._id });
  }

  return opportunity;
}

export async function afterSave(opportunity) {
  await Report.findByIdAndUpdate(opportunity.report_id, {
    $inc: { amount: opportunity.amount },
  });

  await CreateBlingBuyOrder.run({ opportunity });
}

OpportunitySchema.pre('save', beforeSave);
OpportunitySchema.post('save', afterSave);

export default model('Opportunity', OpportunitySchema);
