const express = require("express");
const { requireSignIn } = require("../commonMiddlewares");
const { createOrder, updateOrder } = require("../controllers/order");

const router = express.Router();

router.post("/order/create", requireSignIn, createOrder);

// webhook route to clear cart and update order status
router.post("/order/update", updateOrder);

module.exports = router;
