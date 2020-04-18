import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: Joi.object().keys({
    event: Joi.string().required(),
    current: Joi.object({
      id: Joi.number().required(),
      status: Joi.string().required(),
    }).required(),
  }),
});
