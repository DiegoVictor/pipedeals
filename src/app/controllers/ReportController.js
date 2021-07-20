import { notFound } from '@hapi/boom';

import Report from '../models/Report';
import paginationLinks from '../helpers/paginationLinks';

class ReportController {
  static get projection() {
    return { amount: true, date: true };
  }

  async index(req, res) {
    const { currentUrl } = req;
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
      res.links(paginationLinks(page, pages_total, currentUrl));
    }

    return res.json(
      reports.map((report) => ({
        ...report,
        url: `${currentUrl}/${report._id}`,
        opportunities_url: `${currentUrl}/${report._id}/opportunities`,
      }))
    );
  }

  async show(req, res) {
    const { currentUrl } = req;
    const { id } = req.params;

    const report = await Report.findById(
      id,
      ReportController.projection
    ).lean();
    if (!report) {
      throw notFound('Report not found', { code: 244 });
    }

    return res.json({
      ...report,
      opportunities_url: `${currentUrl}/opportunities`,
      url: currentUrl,
    });
  }
}

export default ReportController;
