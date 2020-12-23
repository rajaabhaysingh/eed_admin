const express = require("express");
const { requireSignIn, adminMiddleware } = require("../commonMiddlewares");
const { createCourse } = require("../controllers/course");
const multer = require("multer");
const { nanoid } = require("nanoid");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, nanoid() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// for multifield multi-file uploads
var multiFileFields = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "contents", maxCount: 1023 },
]);

router.post(
  "/course/create",
  requireSignIn,
  adminMiddleware,
  multiFileFields,
  createCourse
);
// router.get("/category/get", getCategories);

module.exports = router;
