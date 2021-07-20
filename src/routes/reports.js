import { Router } from 'express';

import ReportController from '../app/controllers/ReportController';
import ReportOppotunitiesController from '../app/controllers/ReportOppotunitiesController';
import PageValidator from '../app/validators/PageValidator';
import IdValidator from '../app/validators/IdValidator';
import ReportIdValidator from '../app/validators/ReportIdValidator';
import IdAndReportIdValidator from '../app/validators/IdAndReportIdValidator';

const app = Router();

const reportController = new ReportController();
const reportOppotunitiesController = new ReportOppotunitiesController();

app.get('/', PageValidator, reportController.index);
app.get('/:id', IdValidator, reportController.show);

app.get(
  '/:report_id/opportunities',
  PageValidator,
  ReportIdValidator,
  reportOppotunitiesController.index
);
app.get(
  '/:report_id/opportunities/:id',
  IdAndReportIdValidator,
  reportOppotunitiesController.show
);

export default app;
