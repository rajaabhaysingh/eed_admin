const express = require("express");
const multer = require("multer");
const path = require("path");
const slugify = require("slugify");
const { nanoid } = require("nanoid");
const { signup, login } = require("../controllers/auth");
const {
  validateAuthSignupRequest,
  validateAuthLoginRequest,
  isAuthRequestValidated,
} = require("../validators/auth");

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
/**
 * @swagger
 * /api/login:
 *  post:
 *    description: Use to request all customers
 *    responses:
 *      '201':
 *        description: A successful response
 */
router.post("/login", validateAuthLoginRequest, isAuthRequestValidated, login);

// signup process
router.post(
  "/signup",
  upload.single("profilePicture"),
  validateAuthSignupRequest,
  isAuthRequestValidated,
  signup
);

module.exports = router;
