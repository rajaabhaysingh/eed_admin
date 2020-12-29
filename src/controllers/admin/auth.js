const User = require("../../models/user");
const jwt = require("jsonwebtoken");

// signup controller
exports.signup = async (req, res) => {
  await User.findOne({ email: req.body.email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: `${req.body.email} is already registered.`,
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
          error: `Something went wrong, couldn't create admin. [code: srcoadau]`,
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
        error: `User with email ${req.body.email} isn't registered.`,
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

        res.cookie("token", token, { expiresIn: "1d" });

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
            error: "Oops, User is not an admin.",
          });
        } else {
          // password didn't match
          return res.status(400).json({
            error: "Error: Invalid email/password.",
          });
        }
      }
    } else {
      return res.status(400).json({
        error: `Error: You are not registered as an admin.`,
      });
    }
  });
};

// logout
exports.logout = (req, res, next) => {
  res.clearCookie("token");
  return res.status(200).json({
    data: "Logged out successfully.",
  });
};
