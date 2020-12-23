const express = require("express");
const { signup, login } = require("../controllers/auth");
const {
  validateAuthSignupRequest,
  validateAuthLoginRequest,
  isAuthRequestValidated,
} = require("../validators/auth");

const router = express.Router();

// login process
router.post("/login", validateAuthLoginRequest, isAuthRequestValidated, login);

// signup process
router.post(
  "/signup",
  validateAuthSignupRequest,
  isAuthRequestValidated,
  signup
);

// router.post("/profile", requireSignIn, (req, res) => {
//   res.status(200).json({
//     message: "Inside profile",
//   });
// });

module.exports = router;
