const express = require("express");
const { requireSignIn, userMiddleware } = require("../commonMiddlewares");
const { addCourseToCart } = require("../controllers/cart");
const router = express.Router();

router.post("/cart/add-course", requireSignIn, userMiddleware, addCourseToCart);

module.exports = router;
