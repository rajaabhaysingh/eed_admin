const Cart = require("../models/cart");

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
exports.addCourseToCart = (req, res) => {
  // finding if user cart already exists or not
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error)
      return res.status(400).json({
        error: error,
      });

    if (cart) {
      //if cart already exists then check if the course is already added to cart or not
      let promiseArray = [];

      // for each course item sent in request
      req.body.cartItems.forEach((cartItem) => {
        const product = cartItem.product;

        // finding if course being added is already present in cart
        const item = cart.cartItems.find((c) => c.product == product);
        let condition, update;

        // if item is already present in cart
        if (item) {
          // -------------------
          // ---- if cart has concept of quantity, uncomment following blocl ----
          // ---- it updates quantity of already added product ----
          // condition = { user: req.user._id, "cartItems.product": product };
          // update = {
          //   $set: {
          //     "cartItems.$": cartItem,
          //   },
          // };
          // -------------------

          // respond that item is already available in cart
          return res.status(400).json({
            error: "Course already present in cart.",
          });
        } else {
          condition = { user: req.user._id };
          update = {
            $push: {
              cartItems: cartItem,
            },
          };
        }
        promiseArray.push(runUpdate(condition, update));
        //Cart.findOneAndUpdate(condition, update, { new: true }).exec();
        // .exec((error, _cart) => {
        //     if(error) return res.status(400).json({ error });
        //     if(_cart){
        //         //return res.status(201).json({ cart: _cart });
        //         updateCount++;
        //     }
        // })
      });
      Promise.all(promiseArray)
        .then((response) =>
          res.status(201).json({ data: "Course added to cart." })
        )
        .catch((error) => res.status(400).json({ error: error }));
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
