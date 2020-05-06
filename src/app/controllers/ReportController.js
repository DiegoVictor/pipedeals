import { notFound } from '@hapi/boom';

import Report from '../models/Report';
import paginationLinks from '../helpers/paginationLinks';
import hateoas from '../helpers/hateoas';

class ReportController {
  static get projection() {
    return { amount: true, date: true };
  }

  async index(req, res) {
    const { base_url, resource_url } = req;
    const { page = 1 } = req.query;
    const limit = 10;

    const reports = await Report.find(null, ReportController.projection)
      .lean()
      .sort('-date')
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Report.countDocuments();
    res.header('X-Total-Count', count);

    const pages_total = Math.ceil(count / limit);
    if (pages_total > 1) {
      res.links(paginationLinks(page, pages_total, resource_url));
    }

    return res.json(
      hateoas(reports, {
        url: `${resource_url}/:id`,
        opportunities_url: `${base_url}/v1/reports/:id/opportunities`,
      })
    );
  }

  async show(req, res) {
    const { base_url, resource_url } = req;
    const { id } = req.params;

    const report = await Report.findById(
      id,
      ReportController.projection
    ).lean();
    if (!report) {
      throw notFound('Report not found', { code: 244 });
    }

    return res.json(
      hateoas(report, {
        url: resource_url,
        opportunities_url: `${base_url}/v1/reports/:id/opportunities`,
      })
    );
  }
}

export default new ReportController();
