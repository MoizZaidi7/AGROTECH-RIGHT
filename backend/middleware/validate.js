// 📁 middleware/validate.js
import { validationResult } from 'express-validator';

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ 
      [err.param]: err.msg,
      location: err.location,
      value: err.value 
    }));

    return res.status(422).json({
      successs: false,
      errors: extractedErrors,
    });
  };
};

export default validate;