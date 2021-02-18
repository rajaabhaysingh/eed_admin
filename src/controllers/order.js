const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/user");
const Course = require("../models/course");
const Razorpay = require("razorpay");
const env = require("dotenv");
const { nanoid } = require("nanoid");

env.config();

const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

// create new order
exports.createOrder = async (req, res) => {
  // -- helper function --
  // getTotalPrice
  const getTotalPrice = (cartItems) => {
    if (cartItems && cartItems.length > 0) {
      let netPayable = 0.0;
      const coursesList = [];

      cartItems.forEach((cartItem) => {
        netPayable = netPayable + parseFloat(cartItem.product.price);
        coursesList.push(cartItem.product._id);

        if (parseFloat(cartItem.product.offer) > 0.0) {
          // update netPayable
          netPayable =
            netPayable -
            (
              (parseFloat(cartItem.product.price) *
                parseFloat(cartItem.product.offer)) /
              100
            ).toFixed(2);
        }
      });

      return {
        netPayable: parseFloat(netPayable * 100).toFixed(0),
        coursesList: coursesList,
      };
    } else {
      return {
        netPayable: 0,
        coursesList: {},
      };
    }
  };

  // finding cart associated with user and calculating payable amount
  // NOTE: -- we're doing this just to make things independent of frontend
  await Cart.findOne({ user: req.user._id })
    .populate("cartItems.product", "_id price offer")
    .exec(async (error, cart) => {
      if (error) return res.status(400).json({ error: error });

      if (cart) {
        const { netPayable, coursesList } = getTotalPrice(cart.cartItems);

        const options = {
          amount: netPayable, // amount in the smallest currency unit
          currency: "INR",
          receipt: req.user._id + "#" + nanoid(10),
          payment_capture: true,
          //   notes: tempCourses,
        };

        await razorpay.orders.create(options, (err, order) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }
          if (order) {
            // create currentOrderDetails
            const currentOrderDetails = {
              courses: [...coursesList],
              amountBilled: order.amount,
              rzp_order_id: order.id,
              receipt_id: order.receipt,
              currency: order.currency,
              status: order.status,
              created_at: order.created_at,
              attempts: order.attempts,
            };

            // add order to database
            if (cart.cartItems && cart.cartItems.length > 0) {
              // if order is already present in database
              if (req.order_id) {
                Order.findOneAndUpdate(
                  {
                    user: req.user._id,
                    "orders._id": req.order_id,
                  },
                  {
                    $set: {
                      "orders.$": currentOrderDetails,
                    },
                  }
                ).exec((error, updatedOrder) => {
                  if (error) return res.status(400).json({ error });
                  if (updatedOrder) {
                    //   order created successfully
                    return res.status(201).json({
                      data: {
                        order_id: order.id,
                        amount: order.amount,
                        currency: order.currency,
                        key_id: process.env.RZP_KEY_ID,
                      },
                    });
                  }
                });
              } else {
                Order.findOneAndUpdate(
                  { user: req.user._id },
                  {
                    $push: {
                      orders: currentOrderDetails,
                    },
                  },
                  { new: true, upsert: true }
                ).exec((error, updatedOrder) => {
                  if (error) return res.status(400).json({ error });
                  if (updatedOrder) {
                    //   order created successfully
                    return res.status(201).json({
                      data: {
                        order_id: order.id,
                        amount: order.amount,
                        currency: order.currency,
                        key_id: process.env.RZP_KEY_ID,
                      },
                    });
                  }
                });
              }
            } else {
              res.status(400).json({ error: "Your cart is empty." });
            }
          }
        });
      } else {
        return res.status(400).json({
          error:
            "Some unexpected error occured. Try contacting administrator if problem persists.",
        });
      }
    });
};

// updateOrder
exports.updateOrder = async (req, res) => {
  require("fs").writeFileSync("order.json", JSON.stringify(req.body, null, 4));

  if (req.body.payload.order.entity) {
    const {
      id,
      amount_paid,
      amount_due,
      currency,
      receipt,
      status,
      attempts,
      created_at,
    } = req.body.payload.order.entity;

    const userId = receipt.toString().split("#")[0];

    await Order.findOneAndUpdate(
      {
        user: userId,
        "orders.rzp_order_id": id,
        "orders.receipt_id": receipt,
      },
      {
        $set: {
          "orders.$.amount_paid": amount_paid,
          "orders.$.amount_due": amount_due,
          "orders.$.currency": currency,
          "orders.$.status": status,
          "orders.$.attempts": attempts,
          "orders.$.created_at": created_at,
        },
      },
      { new: true }
    ).exec(async (err, updatedOrder) => {
      if (err) {
        // log err
      }
      if (updatedOrder) {
        // remove cart if paid
        if (status === "paid") {
          await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { cartItems: [] } }
          ).exec((err, updatedCart) => {
            if (err) {
              // log err
              // -- was unable to clear cart --
            }
          });
        }

        // add course to user's account
        const targetOrder = updatedOrder.orders.find(
          (order) => order.rzp_order_id == id
        );
        const enrolledCoursesList = [...targetOrder.courses];

        await User.findOneAndUpdate(
          { _id: userId },
          { $push: { coursesBought: enrolledCoursesList } }
        ).exec((err, updatedUser) => {
          if (err) {
            // log err
            // -- was unable to clear cart --
          }
          if (updatedUser) {
            //   log user course addition sucessful
          }
        });

        // add user under course buyers
        for (const courseId of targetOrder.courses) {
          await Course.findOneAndUpdate(
            { _id: courseId },
            { $push: { enrollments: userId } }
          ).exec((err, updatedCourse) => {
            if (err) {
              // log err
              // -- was unable to clear cart --
            }
            if (updatedCourse) {
              //   log user course addition sucessful
            }
          });
        }

        res.status(200).json({
          status: "Thankyou razorpay.",
        });
      }
    });
  } else {
    console.log("No order body received.");
  }
};
