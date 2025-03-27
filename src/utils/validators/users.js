const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  hobby: Joi.string().valid(
    'hiking',
    'kuliner',
    'fotografi',
    'sejarah',
    'belanja',
    'bahari'
  ).required(),
  age: Joi.number().integer().min(12).max(100).required(),
  occupation: Joi.string().max(100).required(),
  marital_status: Joi.string().valid('Menikah', 'Belum Menikah').required(),
  role: Joi.string().valid('user', 'admin').default('user')
});

const UserUpdateSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  hobby: Joi.string().valid(
    'hiking',
    'kuliner',
    'fotografi',
    'sejarah',
    'belanja',
    'bahari'
  ),
  age: Joi.number().integer().min(12).max(100),
  occupation: Joi.string().max(100),
  marital_status: Joi.string().valid('Menikah', 'Belum Menikah'),
  role: Joi.string().valid('user', 'admin')
});

const UserPasswordUpdateSchema = Joi.object({
  oldPassword: Joi.string().min(8).required(),
  newPassword: Joi.string().min(8).required(),
});

module.exports = { UserPayloadSchema, UserUpdateSchema, UserPasswordUpdateSchema };
