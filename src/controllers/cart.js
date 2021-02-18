const Cart = require("../models/cart");
const User = require("../models/user");

// utility function runUpdate for addCourseToCart
function runUpdate(condition, updateData) {
  return new Promise((resolve, reject) => {
    //you update code here

    Cart.findOneAndUpdate(condition, updateData, { upsert: true })
      .then((result) => resolve())
      .catch((err) => reject(err));
  });
}

// add a course to cart
exports.addCourseToCart = async (req, res) => {
  // finding if user cart already exists or not
  await Cart.findOne({ user: req.user._id }).exec(async (error, cart) => {
    if (error)
      return res.status(400).json({
        error: error,
      });

    if (cart) {
      //if cart already exists then check if the course is already added to cart or not
      let promiseArray = [];

      // find out courses user has already purchased
      await User.findById(req.user._id).exec((err, user) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        if (user) {
          // for each course item sent in request
          req.body.cartItems.forEach((cartItem) => {
            const product = cartItem.product;

            // finding if course being added is already present in cart
            const item = cart.cartItems.find((c) => c.product == product);
            // if user has already bought the course
            const alreadyPurchased = user.coursesBought.find(
              (course) => course == product
            );

            let condition, update;

            // if item is already present in cart
            if (item) {
              // respond that item is already available in cart
              return res.status(400).json({
                error: "Course already present in cart.",
              });
            } else {
              if (alreadyPurchased) {
                return res.status(400).json({
                  error: "You've already purchased this course.",
                });
              } else {
                condition = { user: req.user._id };
                update = {
                  $push: {
                    cartItems: cartItem,
                  },
                };
                promiseArray.push(runUpdate(condition, update));
              }
            }
          });
          Promise.all(promiseArray)
            .then((response) =>
              res.status(201).json({ data: "Course added to cart." })
            )
            .catch((error) => res.status(400).json({ error: error }));
        }
      });
    } else {
      //if cart not exist then create a new cart
      const cart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });

      cart.save((err, cart) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        if (cart) {
          return res.status(201).json({
            data: cart,
          });
        }
      });
    }
  });
};

// getCartItems
exports.getCartItems = async (req, res) => {
  await Cart.findOne({ user: req.user._id })
    .populate(
      "cartItems.product",
      "_id name slug price thumbnail ratings offer level"
    )
    .exec((error, cart) => {
      if (error) return res.status(400).json({ error: error });
      if (cart) {
        let cartItems = [];
        cart.cartItems.forEach((item, index) => {
          cartItems.push(item);
        });
        res.status(200).json({ data: cartItems });
      } else {
        return res.status(404).json({
          error: "Cart not available. Add courses to your cart first.",
        });
      }
    });
};
