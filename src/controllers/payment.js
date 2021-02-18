const Payment = require("../models/payment");
const env = require("dotenv");
const crypto = require("crypto");

env.config();

// create new payment entry
exports.createPayment = async (req, res) => {
  if (req.body.payload.payment.entity) {
    const {
      id,
      amount,
      currency,
      status,
      order_id,
      invoice_id,
      is_intl,
      method,
      amt_refunded,
      refund_status,
      captured,
      description,
      card_id,
      card,
      bank,
      wallet,
      vpa,
      email,
      contact,
      fee,
      tax,
      notes,
      error_code,
      error_description,
      error_source,
      error_step,
      error_reason,
    } = req.body.payload.payment.entity;

    const shasum = crypto.createHmac("sha256", process.env.RZP_WEBHOOK_SECRET);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    const _payment = new Payment({
      rzp_pay_id: id,
      amount,
      currency,
      status,
      rzp_order_id: order_id,
      rzp_invoice_id: invoice_id,
      is_intl,
      method,
      amt_refunded,
      refund_status,
      captured,
      desc: description,
      card_id,
      card,
      bank,
      wallet,
      vpa,
      email,
      contact,
      fee,
      tax,
      notes,
      error_code,
      error_desc: error_description,
      error_source,
      error_step,
      error_reason,
      verified: digest === req.headers["x-razorpay-signature"],
      event_id: req.headers["x-razorpay-event-id"],
    });

    // handling multiple "same" request (incase if it occurs)
    const duplicatePaymentObj = await Payment.findOne({
      event_id: req.headers["x-razorpay-event-id"],
      rzp_order_id: order_id,
    });

    if (duplicatePaymentObj) {
      //   find one and update
      Payment.findOneAndUpdate(
        {
          event_id: req.headers["x-razorpay-event-id"],
          rzp_order_id: order_id,
        },
        _payment,
        {
          new: true,
        }
      ).exec((error, updatedPayment) => {
        if (error) {
          // log error
        }

        if (updatedPayment) {
          // NOTE: clear-cart and update-order-status have been handled through different webhook (check inside "order" routes)
          // mendatory (dummy) response to razorpay to keep connection alive
          res.status(200).json({
            status: "Thankyou razorpay.",
          });
        }
      });
    } else {
      //   create new payment
      _payment.save((err, savedPaymentObj) => {
        if (err) {
          // log payment errors
        }

        if (savedPaymentObj) {
          // NOTE: clear-cart and update-order-status have been handled through different webhook (inside "order" routes)
          // mendatory (dummy) response to razorpay to keep connection alive
          res.status(200).json({
            status: "Thankyou razorpay.",
          });
        }
      });
    }
  } else {
    console.log("No payment object received");
  }
};
