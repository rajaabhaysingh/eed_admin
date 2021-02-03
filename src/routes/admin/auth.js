const express = require("express");
const { signup, login, logout } = require("../../controllers/admin/auth");
const multer = require("multer");
const slugify = require("slugify");
const { nanoid } = require("nanoid");
const path = require("path");
const {
  validateAuthSignupRequest,
  validateAuthLoginRequest,
  isAuthRequestValidated,
} = require("../../validators/auth");

const router = express.Router();

// saving video files inside profile_pic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "profile_pic"));
  },
  filename: function (req, file, cb) {
    cb(null, nanoid() + "-" + slugify(file.originalname));
  },
});

const upload = multer({ storage: storage });

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
  upload.single("profilePicture"),
  validateAuthSignupRequest,
  isAuthRequestValidated,
  signup
);

// logout
router.post("/admin/logout", logout);

module.exports = router;
