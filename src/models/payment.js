const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true,
    },
    rzp_pay_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    rzp_order_id: {
      type: String,
      required: true,
    },
    rzp_invoice_id: {
      type: String,
    },
    is_intl: {
      type: Boolean,
      required: true,
      default: false,
    },
    method: {
      type: String,
      required: true,
    },
    amt_refunded: {
      type: Number,
      required: true,
      default: 0,
    },
    refund_status: {
      type: String,
    },
    captured: {
      type: Boolean,
      required: true,
      default: false,
    },
    desc: {
      type: String,
    },
    card_id: {
      type: String,
    },
    card: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      last4: {
        type: String,
      },
      network: {
        type: String,
      },
      type: {
        type: String,
      },
    },
    bank: {
      type: String,
    },
    wallet: {
      type: String,
    },
    vpa: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
    },
    tax: {
      type: Number,
    },
    notes: [
      {
        key: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    error_code: {
      type: String,
    },
    error_desc: {
      type: String,
    },
    error_source: {
      type: String,
    },
    error_step: {
      type: String,
    },
    error_reason: {
      type: String,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
