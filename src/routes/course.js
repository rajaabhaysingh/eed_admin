const express = require("express");
const { requireSignIn, adminMiddleware } = require("../commonMiddlewares");
const {
  createCourse,
  addCourseModule,
  getAllCourses,
  addModuleContent,
} = require("../controllers/course");
const multer = require("multer");
const { nanoid } = require("nanoid");
const path = require("path");
const slugify = require("slugify");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, nanoid() + "-" + slugify(file.originalname));
  },
});

const upload = multer({ storage: storage });

// create new course without any modules
router.post(
  "/course/create",
  requireSignIn,
  adminMiddleware,
  upload.single("thumbnail"),
  createCourse
);

// add modules to previously created courses
router.post(
  "/course/create/add-new-module",
  requireSignIn,
  adminMiddleware,
  upload.none(),
  addCourseModule
);

// add modules to previously created courses
router.post(
  "/course/create/module/add-new-content",
  requireSignIn,
  adminMiddleware,
  upload.array("mediaFiles"),
  addModuleContent
);

// get list of all courses
router.get("/course/get", getAllCourses);

module.exports = router;
