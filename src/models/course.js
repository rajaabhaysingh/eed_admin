const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
    },
    desc: {
      type: String,
      require: true,
      trim: true,
    },
    offer: {
      type: Number,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    modules: [
      {
        moduleNo: {
          type: Number,
          required: true,
        },
        moduleName: {
          type: String,
          trim: true,
          required: true,
        },
        contents: [
          {
            priority: {
              type: Number,
              required: true,
              default: 1,
            },
            topicName: {
              type: String,
              required: true,
              trim: true,
            },
            desc: {
              type: String,
            },
            duration: {
              type: Number,
              default: 0,
            },
            file: {
              type: String,
            },
          },
        ],
      },
    ],
    faqs: [
      {
        que: {
          type: String,
        },
        answer: {
          type: String,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        review: String,
      },
    ],
    lastUpdated: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
