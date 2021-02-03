const express = require("express");
const { requireSignIn, adminMiddleware } = require("../commonMiddlewares");
const {
  addCategory,
  getCategories,
  updateCategories,
} = require("../controllers/categories");
const multer = require("multer");
const { nanoid } = require("nanoid");
const router = express.Router();
const path = require("path");
const slugify = require("slugify");
const {
  validateAddCategory,
  isAddCategoryRequestValidated,
} = require("../validators/category");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + "-" + nanoid() + "-" + slugify(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post(
  "/category/create",
  requireSignIn,
  adminMiddleware,
  upload.single("categoryImage"),
  validateAddCategory,
  isAddCategoryRequestValidated,
  addCategory
);

router.get("/category/get", getCategories);

router.put(
  "/category/update",
  requireSignIn,
  adminMiddleware,
  upload.array("categoryImage"),
  validateAddCategory,
  isAddCategoryRequestValidated,
  updateCategories
);

module.exports = router;
