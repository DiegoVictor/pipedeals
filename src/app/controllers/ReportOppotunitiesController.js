import { badRequest, notFound } from '@hapi/boom';

import Opportunity from '../models/Opportunity';
import Report from '../models/Report';
import paginationLinks from '../helpers/paginationLinks';
import hateoas from '../helpers/hateoas';

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
    const { base_url, resource_url } = req;
    const { report_id } = req.params;
    const { page = 1 } = req.query;
    const limit = 10;

    const report = await Report.findById(report_id);
    if (!report) {
      throw badRequest('Report not found', { code: 240 });
    }

    const opportunities = await Opportunity.find({ report_id }, projection)
      .lean()
      .sort('createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Opportunity.where({ report_id }).countDocuments();
    res.header('X-Total-Count', count);

    const pages_total = Math.ceil(count / limit);
    if (pages_total > 1) {
      res.links(paginationLinks(page, pages_total, resource_url));
    }

    return res.json(
      hateoas(opportunities, {
        url: `${resource_url}/:id`,
        report: {
          _id: report_id,
          url: `${base_url}/v1/reports/${report_id}`,
        },
      })
    );
  }

  async show(req, res) {
    const { base_url, resource_url } = req;
    const { report_id, id } = req.params;

    const opportunity = await Opportunity.findOne(
      { _id: id, report_id },
      projection
    ).lean();
    if (!opportunity) {
      throw notFound('Opportunity not found', { code: 344 });
    }

    return res.json(
      hateoas(opportunity, {
        url: resource_url,
        report: {
          _id: report_id,
          url: `${base_url}/v1/reports/${report_id}`,
        },
      })
    );
  }
}

export default new ReportOpportunitiesController();
