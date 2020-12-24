const User = require("../../models/user");
const jwt = require("jsonwebtoken");

// signup controller
exports.signup = async (req, res) => {
  await User.findOne({ email: req.body.email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        message: `${req.body.email} is already registered.`,
      });
    }

    // --- else continue creating User ---
    // destructure the request data first
    const { firstName, middleName, lastName, email, password } = req.body;

    const _user = new User({
      firstName,
      middleName,
      lastName,
      email,
      password,
      username: Math.random().toString(),
      role: "admin",
    });

    _user.save((err, data) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          message: `Something went wrong, couldn't create admin. [code: srcoadau]`,
        });
      }

      if (data) {
        return res.status(201).json({
          data: "Admin created successfully.",
        });
      }
    });
  });
};

// login controller
exports.login = async (req, res) => {
  await User.findOne({ email: req.body.email }).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        message: `User with email ${req.body.email} isn't registered.`,
      });
    }

    // --- else continue logging in ---
    if (user) {
      if (user.authenticate(req.body.password) && user.role === "admin") {
        const token = jwt.sign(
          {
            _id: user._id,
            role: user.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        // destructure the user fields first
        const {
          _id,
          firstName,
          middleName,
          lastName,
          role,
          email,
          fullname,
          profilePicture,
        } = user;

        res.status(200).json({
          token,
          data: {
            _id,
            firstName,
            middleName,
            lastName,
            role,
            email,
            fullname,
            profilePicture,
          },
        });
      } else {
        if (user.role !== "admin") {
          return res.status(400).json({
            message: "User is not an admin.",
          });
        } else {
          // password didn't match
          return res.status(400).json({
            message: "Invalid email/password.",
          });
        }
      }
    } else {
      return res.status(400).json({
        message: `Something went wrong. [code: srcoadau]`,
      });
    }
  });
};
