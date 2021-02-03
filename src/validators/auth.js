const { check, validationResult } = require("express-validator");

exports.validateAuthSignupRequest = [
  check("firstName").notEmpty().withMessage("Firstname cannot be empty."),
  check("lastName").notEmpty().withMessage("Lastname cannot be empty."),
  check("email").isEmail().withMessage("Invalid email address."),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 characters long."),
];

exports.validateAuthLoginRequest = [
  check("email").isEmail().withMessage("Invalid email address."),
];

exports.isAuthRequestValidated = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.array().length > 0) {
    return res.status(400).json({
      error: validationErrors.array()[0].msg,
    });
  }

  next();
};
