import Opportunity from '../models/Opportunity';
import Report from '../models/Report';

const projection = {
  report_id: false,
  'supplier._id': false,
  'client._id': false,
  'parcels._id': false,
  'items._id': false,
  createdAt: false,
  updatedAt: false,
  __v: false,
};

class ReportOpportunitiesController {
  async index(req, res) {
    const { report_id } = req.params;
    const { page = 1 } = req.query;
    const limit = 10;

    const report = await Report.findById(report_id);
    const opportunities = await Opportunity.find({ report_id }, projection)
      .lean()
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Opportunity.where({ report_id }).countDocuments();
    res.header('X-Total-Count', count);
    return res.json(
      opportunities.map(opportunity => ({
        ...opportunity,
      }))
    );
  }

}

export default new ReportOpportunitiesController();
