const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// defining user Schema
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      min: 1,
      max: 63,
    },
    middleName: {
      type: String,
      trim: true,
      min: 1,
      max: 63,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      min: 1,
      max: 63,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    contact: {
      type: String,
      max: 13,
    },
    profilePicture: {
      type: String,
    },
    coursesBought: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

// --- setting/getting up virtual fields ---
// setting virual field password
// userSchema.virtual("password").set(function (password) {
//   this.password_hash = bcrypt.hashSync(password, 10);
// });

// getting virtual field fullName
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.middleName} ${this.lastName}`;
});

// method(s) related to auth
userSchema.methods = {
  authenticate: async function (password) {
    return await bcrypt.compare(password, this.password_hash);
  },
};

module.exports = mongoose.model("User", userSchema);
