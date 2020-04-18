import Report from '../models/Report';

class ReportController {
  async index(req, res) {
    const { resource_url } = req;
    const { page = 1 } = req.query;
    const limit = 30;

    const reports = await Report.find()
      .lean()
      .sort('-date')
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json(
      reports.map(report => ({
        ...report,
        url: resource_url,
      }))
    );
  }
}

export default new ReportController();
