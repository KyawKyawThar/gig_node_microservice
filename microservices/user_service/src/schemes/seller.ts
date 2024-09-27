import Joi from 'joi';

export const sellerSchemaValidate = Joi.object().keys({
  fullName: Joi.string().required().messages({
    'strings.base': 'fullName must be type of string',
    'strings.empty': 'fullName is required',
    'any.required': 'fullName is required'
  }),
  _id: Joi.string().optional(),
  id: Joi.string().optional(),
  userName: Joi.string().required().messages({
    'strings.base': 'username must be type of string',
    'strings.empty': 'username is required',
    'any.required': 'username is required'
  }),
  email: Joi.string().required().messages({
    'strings.base': 'email must be type of string',
    'strings.empty': 'email is required',
    'any.required': 'email is required'
  }),
  profilePicture: Joi.string().required().messages({
    'strings.base': 'profilePicture must be type of string',
    'strings.empty': 'profilePicture is required',
    'any.required': 'profilePicture is required'
  }),
  description: Joi.string().required().messages({
    'strings.base': 'description must type of string',
    'strings.empty': 'Seller description is required',
    'any.required': 'Seller description is required'
  }),
  profilePublicID: Joi.string().optional().allow(null, ''),
  languages: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().optional(),
        language: Joi.string(),
        level: Joi.string()
      })
    )
    .required()
    .min(1)
    .messages({
      'strings.base': 'Please add at least one language',
      'strings.empty': 'language is required',
      'any.required': 'language is required',
      'array.min': 'Please add at least one language'
    }),
  skills: Joi.string().required().messages({
    'strings.base': 'Please add yours skills',
    'strings.empty': 'skills is required',
    'any.required': 'skills is required'
  }),
  ratingCount: Joi.number().optional(),
  ratingSum: Joi.number().optional(),
  ratingCategories: Joi.object({
    five: { value: Joi.number(), count: Joi.number() },
    four: { value: Joi.number(), count: Joi.number() },
    three: { value: Joi.number(), count: Joi.number() },
    two: { value: Joi.number(), count: Joi.number() },
    one: { value: Joi.number(), count: Joi.number() }
  }),
  responseTime: Joi.number().required().greater(0).messages({
    'number.base': 'Please add response time',
    'number.greater': 'Response time must be greater than zero',
    'number.empty': 'Response time is required',
    'number.required': 'Response time is required'
  }),
  recentDelivery: Joi.string().optional().allow(null, ''),
  experience: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().optional(),
        company: Joi.string(),
        title: Joi.string(),
        startDate: Joi.date(),
        endDate: Joi.date(),
        description: Joi.string(),
        currentlyWorkingHere: Joi.boolean()
      })
    )
    .required()
    .min(1)
    .messages({
      'string.base': 'Please add at least one work experience',
      'string.empty': 'work experience is required',
      'string.required': 'work experience is required',
      'array.main': 'Please add at least one work experience'
    }),
  educations: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().optional(),
        country: Joi.string(),
        title: Joi.string(),
        university: Joi.string(),
        major: Joi.string(),
        year: Joi.date()
      })
    )
    .required()
    .min(1)
    .messages({
      'string.base': 'Please add at least one education',
      'string.empty': 'education is required',
      'string.required': 'education is required',
      'array.main': 'Please add at least one education'
    }),
  socialLinks: Joi.array().optional().allow(null, ''),
  certificates: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().optional,
        name: Joi.string(),
        from: Joi.string(),
        to: Joi.string()
      })
    )
    .optional()
    .allow(null, '')
});
