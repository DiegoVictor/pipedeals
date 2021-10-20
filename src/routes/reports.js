import { Router } from 'express';

import ReportController from '../app/controllers/ReportController';
import ReportOppotunitiesController from '../app/controllers/ReportOppotunitiesController';
import PageValidator from '../app/validators/PageValidator';
import IdValidator from '../app/validators/IdValidator';
import IdAndOpportunityIdValidator from '../app/validators/IdAndOpportunityIdValidator';

const app = Router();

const reportController = new ReportController();
const reportOppotunitiesController = new ReportOppotunitiesController();

app.get('/', PageValidator, reportController.index);
app.get('/:id', IdValidator, reportController.show);

app.get(
  '/:id/opportunities',
  PageValidator,
  IdValidator,
  reportOppotunitiesController.index
);
app.get(
  '/:id/opportunities/:opportunity_id',
  IdAndOpportunityIdValidator,
  reportOppotunitiesController.show
);

export default app;
