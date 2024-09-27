import Joi, { ObjectSchema } from 'joi';

export const signInSchema: ObjectSchema = Joi.object().keys({
  email: Joi.alternatives().conditional(Joi.string().pattern(/^[a-zA-Z0-9_]+$/), {
    then: Joi.string().min(4).max(12).optional().messages({
      'string.base': 'Username must be of type string',
      'string.email': 'Invalid Username',
      'string.empty': 'Username is a required field'
    }),
    otherwise: Joi.string().email().required().messages({
      'string.base': 'email must be of type string',
      'string.min': 'Invalid email',
      'string.max': 'Invalid email',
      'string.empty': 'Email is a required field'
    })
  }),
  password: Joi.string().min(4).max(12).required().messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  }),
  browserName: Joi.string().required().messages({
    'string.base': 'browserName must be of type string',
    'string.empty': 'browserName is  required'
  }),
  deviceType: Joi.string().required().messages({
    'string.base': 'deviceType must be of type string',
    'string.empty': 'deviceType is  required field'
  })
});
