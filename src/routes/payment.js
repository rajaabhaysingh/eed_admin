const express = require("express");
const { createPayment } = require("../controllers/payment");

const router = express.Router();

router.post("/payment/create", createPayment);

module.exports = router;
