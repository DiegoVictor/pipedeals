import Report from '../models/Report';

class ReportController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const limit = 30;

    const reports = await Report.find()
      .sort('-date')
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json(reports);
  }
}

export default new ReportController();
