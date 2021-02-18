const express = require("express");
const { requireSignIn, userMiddleware } = require("../commonMiddlewares");
const { addCourseToCart, getCartItems } = require("../controllers/cart");
const router = express.Router();

router.post("/cart/add-course", requireSignIn, userMiddleware, addCourseToCart);

router.get("/cart/get", requireSignIn, userMiddleware, getCartItems);

module.exports = router;
