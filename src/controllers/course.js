const Course = require("../models/course");
const slugify = require("slugify");

exports.createCourse = async (req, res) => {
  // destructuring form data first
  const { name, category, price, desc } = req.body;

  // picking out thumbnail and modulesVideos from req
  let thumbnail;
  let modulesVideos = [];

  if (req.files.thumbnail.length > 0) {
    thumbnail = req.files.thumbnail[0].filename;
  } else {
    res.status(400).json({
      message: "Course thumbnail is required.",
    });
  }

  if (req.files.contents.length > 0) {
    console.log("content videos found");
    modulesVideos = req.files.contents.map((file) => {
      return file.filename;
    });
  }

  const course = new Course({
    name: name,
    slug: slugify(name),
    category,
    price,
    desc,
    thumbnail,
    createdBy: req.user._id,
  });

  course.save((error, course) => {
    if (error) return res.status(400).json({ error: error });

    if (course) {
      res.status(201).json({
        course,
      });
    }
  });
};
