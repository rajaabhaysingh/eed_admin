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
    level: {
      type: String,
      enum: ["Basic", "Intermediate", "Advanced"],
      default: "Basic",
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
    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
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
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: [
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
            addedBy: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            mediaFiles: [
              {
                type: String,
              },
            ],
          },
        ],
      },
    ],
    instructors: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        picture: {
          type: String,
        },
        designation: {
          type: String,
          trim: true,
        },
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
