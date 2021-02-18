const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orders: [
      {
        courses: [
          {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Course",
          },
        ],
        amountBilled: {
          type: Number,
          required: true,
        },
        rzp_order_id: {
          type: String,
          required: true,
        },
        receipt_id: {
          type: String,
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
        created_at: {
          type: Number,
          required: true,
        },
        attempts: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
