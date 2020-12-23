const express = require("express");
const { signup, login } = require("../../controllers/admin/auth");
const {
  validateAuthSignupRequest,
  validateAuthLoginRequest,
  isAuthRequestValidated,
} = require("../../validators/auth");

const router = express.Router();

// login process
router.post(
  "/admin/login",
  validateAuthLoginRequest,
  isAuthRequestValidated,
  login
);

// signup process
router.post(
  "/admin/signup",
  validateAuthSignupRequest,
  isAuthRequestValidated,
  signup
);

module.exports = router;
