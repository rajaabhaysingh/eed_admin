const express = require("express");
const { requireSignIn } = require("../../commonMiddlewares");
const { signup, login, logout } = require("../../controllers/admin/auth");
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

// logout
router.post("/admin/logout", logout);

module.exports = router;
