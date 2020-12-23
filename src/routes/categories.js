const express = require("express");
const { requireSignIn, adminMiddleware } = require("../commonMiddlewares");
const { addCategory, getCategories } = require("../controllers/categories");
const router = express.Router();

router.post("/category/create", requireSignIn, adminMiddleware, addCategory);
router.get("/category/get", getCategories);

module.exports = router;
