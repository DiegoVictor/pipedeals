import { celebrate, Segments, Joi } from 'celebrate';
import ObjectId from 'joi-objectid';

Joi.objectId = ObjectId(Joi);

export default celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.objectId().required(),
    opportunity_id: Joi.objectId().required(),
  }),
});
