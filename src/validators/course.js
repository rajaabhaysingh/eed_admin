const { check, validationResult } = require("express-validator");

exports.validateAddCourse = [
  check("name").notEmpty().withMessage("Course name cannot be empty.").trim(),
  check("category").notEmpty().withMessage("Category cannot be empty.").trim(),
  check("level").notEmpty().withMessage("Course level is required.").trim(),
  check("price")
    .notEmpty()
    .withMessage("Please provide course price. Enter 0 if its free.")
    .trim(),
  check("desc")
    .notEmpty()
    .withMessage("Course description cannot be empty.")
    .trim(),
];

exports.validateAddModule = [
  check("moduleNo")
    .notEmpty()
    .withMessage("Course name cannot be empty.")
    .isNumeric()
    .withMessage("Module number must be a positive number.")
    .trim(),
  check("moduleName")
    .notEmpty()
    .withMessage("Module name cannot be empty.")
    .trim(),
];

exports.isAddCourseRequestValidated = (req, res, next) => {
  const validationErrors = validationResult(req);

  if (validationErrors.array().length > 0) {
    return res.status(400).json({
      error: validationErrors.array()[0].msg,
    });
  }

  next();
};
