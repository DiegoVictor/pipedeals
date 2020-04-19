import Report from '../models/Report';
import PaginationLinks from '../services/PaginationLinks';

class ReportController {
  async index(req, res) {
    const { resource_url } = req;
    const { page = 1 } = req.query;
    const limit = 10;

    const reports = await Report.find(null, { amount: true, date: true })
      .lean()
      .sort('-date')
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Report.countDocuments();
    res.header('X-Total-Count', count);

    if (count > limit) {
      const links = PaginationLinks.run({
        resource_url,
        page,
        pages_total: Math.ceil(count / limit),
      });
      if (Object.keys(links).length > 0) {
        res.links(links);
      }
    }

    return res.json(
      reports.map(report => ({
        ...report,
        url: resource_url,
      }))
    );
  }
}

export default new ReportController();
