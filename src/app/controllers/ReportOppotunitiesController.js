import { notFound } from '@hapi/boom';

import Opportunity from '../models/Opportunity';
import Report from '../models/Report';
import paginationLinks from '../helpers/paginationLinks';

class ReportOpportunitiesController {
  static get projection() {
    return {
      report_id: false,
      'supplier._id': false,
      'client._id': false,
      'parcels._id': false,
      'items._id': false,
      createdAt: false,
      updatedAt: false,
      __v: false,
    };
  }

  async index(req, res) {
    const { hostUrl, currentUrl } = req;
    const { id } = req.params;
    const { page = 1 } = req.query;
    const limit = 10;

    const report = await Report.findById(id);
    if (!report) {
      throw notFound('Report not found', { code: 244 });
    }

    const opportunities = await Opportunity.find(
      { report_id: id },
      ReportOpportunitiesController.projection
    )
      .lean()
      .sort('createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Opportunity.where({ report_id: id }).countDocuments();
    res.header('X-Total-Count', count);

    const pages_total = Math.ceil(count / limit);
    if (pages_total > 1) {
      res.links(paginationLinks(page, pages_total, currentUrl));
    }

    return res.json(
      opportunities.map((opportunity) => ({
        ...opportunity,
        report_url: `${hostUrl}/v1/reports/${id}`,
        url: `${currentUrl}/${opportunity._id}`,
      }))
    );
  }

  async show(req, res) {
    const { hostUrl, currentUrl } = req;
    const { id, opportunity_id } = req.params;

    const opportunity = await Opportunity.findOne(
      { _id: opportunity_id, report_id: id },
      ReportOpportunitiesController.projection
    ).lean();

    if (!opportunity) {
      throw notFound('Opportunity not found', { code: 344 });
    }

    return res.json({
      ...opportunity,
      report_url: `${hostUrl}/v1/reports/${id}`,
      url: currentUrl,
    });
  }
}

export default ReportOpportunitiesController;
