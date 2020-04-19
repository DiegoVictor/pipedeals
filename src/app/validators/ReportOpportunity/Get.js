import { celebrate, Segments, Joi } from 'celebrate';
import ObjectId from 'joi-objectid';

Joi.objectId = ObjectId(Joi);

export default celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    report_id: Joi.objectId().required(),
  }),
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number(),
  }),
});
