import { notFound } from '@hapi/boom';

import Report from '../models/Report';
import PaginationLinks from '../services/PaginationLinks';
import hateoas from '../helpers/hateoas';

class ReportController {
  async index(req, res) {
    const { base_url, resource_url } = req;
    const { page = 1 } = req.query;
    const limit = 10;

    const reports = await Report.find(null, { amount: true, date: true })
      .lean()
      .sort('-date')
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Report.countDocuments();
    res.header('X-Total-Count', count);

    const pages_total = Math.ceil(count / limit);
    if (pages_total > 1) {
      res.links(
        PaginationLinks.run({
          resource_url,
          page,
          pages_total,
        })
      );
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

    const report = await Report.findById(id, {
      amount: true,
      date: true,
    }).lean();
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
