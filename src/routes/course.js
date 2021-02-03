const express = require("express");
const { requireSignIn, adminMiddleware } = require("../commonMiddlewares");
const {
  createCourse,
  addCourseModule,
  getAllCourses,
  addModuleContent,
  getCourseById,
  getCourseByCourseSlug,
  getVideoById,
  addCourseExercise,
  getCoursesByCategorySlug,
} = require("../controllers/course");
const multer = require("multer");
const { nanoid } = require("nanoid");
const path = require("path");
const slugify = require("slugify");
const {
  validateAddCourse,
  isAddCourseRequestValidated,
  validateAddModule,
} = require("../validators/course");

const router = express.Router();

// saving video files inside course_contents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "course_contents"));
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + nanoid() + "-" + slugify(file.originalname));
  },
});

// saving course thumbnail inside uploads
const storageAlt = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + nanoid() + "-" + slugify(file.originalname));
  },
});

const upload = multer({ storage: storage });
const uploadAlt = multer({ storage: storageAlt });

// create new course without any modules
router.post(
  "/course/create",
  requireSignIn,
  adminMiddleware,
  uploadAlt.single("thumbnail"),
  validateAddCourse,
  isAddCourseRequestValidated,
  createCourse
);

// add modules to previously created courses
router.post(
  "/course/create/add-new-module",
  requireSignIn,
  adminMiddleware,
  upload.none(),
  validateAddModule,
  isAddCourseRequestValidated,
  addCourseModule
);

// add content to previously created modules
router.post(
  "/course/create/module/add-new-content",
  requireSignIn,
  adminMiddleware,
  upload.single("media"),
  addModuleContent
);

// add modules to previously created courses
router.post(
  "/course/create/module/add-new-exercise",
  requireSignIn,
  adminMiddleware,
  addCourseExercise
);

// get list of all courses
router.get("/course/get", getAllCourses);

// get specific course by "id"
router.get("/course/get-course-by-id/:courseId", requireSignIn, getCourseById);

// get specific course by "slug"
router.get(
  "/course/get-course-by-course-slug/:courseSlug",
  getCourseByCourseSlug
);

// get course video
router.get("/content/course-videos/:videoId", getVideoById);

// get all courses under some category
router.get(
  "/course/get-courses-by-category/:categorySlug",
  getCoursesByCategorySlug
);

module.exports = router;
