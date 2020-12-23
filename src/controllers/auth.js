const User = require("../models/user");
const jwt = require("jsonwebtoken");

// signup controller
exports.signup = async (req, res) => {
  try {
    await User.findOne({ email: req.body.email }).exec((err, user) => {
      if (err) {
        return res.status(400).json({
          message: `Some error occured during signup process. [code: srcoau]`,
        });
      }

      if (user) {
        return res.status(400).json({
          message: `User with email ${req.body.email} already exists.`,
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
      });

      _user.save((err, data) => {
        if (err) {
          console.log(err);
          return res.status(400).json({
            message: `Something went wrong, couldn't create user. [code: srcoau]`,
          });
        }

        if (data) {
          return res.status(201).json({
            message: "User created successfully.",
          });
        }
      });
    });
  } catch (error) {
    console.log("Error in user signup: ", error.message);
    return res.status(400).json({
      message: error,
    });
  }
};

// login controller
exports.login = async (req, res) => {
  try {
    await User.findOne({ email: req.body.email }).exec((err, user) => {
      if (err) {
        return res.status(400).json({
          message: `User with email ${req.body.email} isn't registered.`,
        });
      }

      // --- else continue logging in ---
      if (user) {
        if (user.authenticate(req.body.password)) {
          const token = jwt.sign(
            {
              _id: user._id,
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
          // password didn't match
          return res.status(400).json({
            message: "Invalid email/password.",
          });
        }
      } else {
        return res.status(400).json({
          message: `Something went wrong. [code: srcoau]`,
        });
      }
    });
  } catch (error) {
    console.log("Error in user login: ", error.message);
    return res.status(400).json({
      message: error,
    });
  }
};