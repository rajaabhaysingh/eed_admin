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
      enum: ["Beginner", "Intermediate", "Advanced", "For everyone"],
      default: "For everyone",
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
      required: true,
      trim: true,
    },
    isFreezed: {
      type: Boolean,
      default: false,
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
    },
    language: {
      type: String,
      enum: ["English", "Tamil", "Telugu", "Hindi"],
      default: "English",
    },
    features: [
      {
        feature: {
          type: String,
          trim: true,
        },
      },
    ],
    outline: [
      {
        mainTopic: {
          type: String,
          trim: true,
        },
        subTopics: [
          {
            subTopic: [
              {
                type: String,
                trim: true,
                required: true,
              },
            ],
          },
        ],
      },
    ],
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
            media: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Video",
            },
            programs: [
              {
                language: {
                  type: String,
                  trim: true,
                  required: true,
                },
                code: {
                  type: String,
                  trim: true,
                  required: true,
                },
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
        designation: {
          type: String,
          trim: true,
        },
      },
    ],
    exercises: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        desc: {
          type: String,
          trim: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        problems: [
          {
            question: {
              type: String,
              required: true,
              trim: true,
            },
            options: [
              {
                type: String,
                trim: true,
              },
            ],
            answer: {
              type: String,
              trim: true,
            },
            explanation: {
              type: String,
              trim: true,
            },
            programs: [
              {
                language: {
                  type: String,
                  trim: true,
                  required: true,
                },
                code: {
                  type: String,
                  trim: true,
                  required: true,
                },
              },
            ],
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
    ratings: {
      oneStar: {
        type: Number,
        default: 0,
      },
      twoStar: {
        type: Number,
        default: 0,
      },
      threeStar: {
        type: Number,
        default: 0,
      },
      fourStar: {
        type: Number,
        default: 0,
      },
      fiveStar: {
        type: Number,
        default: 0,
      },
    },
    lastUpdated: Date,
    enrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// getting virtual field noOfEnrollments
courseSchema.virtual("noOfEnrollments").get(function () {
  return this.enrollments.length;
});

module.exports = mongoose.model("Course", courseSchema);
