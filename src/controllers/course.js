const Course = require("../models/course");
const slugify = require("slugify");

// create new course without adding any modules/contents
exports.createCourse = (req, res) => {
  // destructuring form data first
  const { name, category, price, desc } = req.body;

  // picking out thumbnail from req
  const thumbnail = "/static/" + req.file.filename;

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
    if (error) return res.status(400).json({ message: error });

    if (course) {
      res.status(201).json({
        data: course,
      });
    }
  });
};

// add modules to already added course
exports.addCourseModule = (req, res) => {
  const { courseId, moduleNo, moduleName } = req.body;

  const addedBy = req.user._id;

  Course.findOne({ _id: courseId }).exec((err, course) => {
    if (err) {
      console.log("Error in finding course: ", err);
      return res.status(400).json({
        message: err,
      });
    }

    if (course) {
      course.modules.push({
        moduleNo,
        moduleName,
        addedBy: addedBy,
      });
      course.save((error, course) => {
        if (error) return res.status(400).json({ message: error });

        if (course) {
          res.status(201).json({
            data: course,
          });
        }
      });
    }
  });
};

// add content to already added module
exports.addModuleContent = (req, res) => {
  const { courseId, moduleId, priority, topicName, duration, desc } = req.body;

  const addedBy = req.user._id;

  let mediaFiles = [];

  // check if request have some media files
  if (req.files && req.files.length > 0) {
    mediaFiles = req.files.map((file) => {
      return "/course-content/" + file.filename;
    });
  }

  Course.findOne({ _id: courseId }).exec((err, course) => {
    if (err) {
      console.log("Error in finding course: ", err);
      return res.status(404).json({
        message: `Course with id: ${courseId} not found.`,
      });
    }

    if (course) {
      // flag to check if module found or not
      let isModuleAvailable = false;

      // loop and find the target module
      for (let i = 0; i < course.modules.length; i++) {
        // do not use "===" in the next line
        if (course.modules[i]._id == moduleId) {
          // mark module found flag
          isModuleAvailable = true;
          // do content push

          course.modules[i].content.push({
            priority,
            topicName,
            duration,
            desc,
            mediaFiles,
            addedBy: addedBy,
          });

          course.save((error, course) => {
            if (error) return res.status(400).json({ message: error });

            if (course) {
              res.status(201).json({
                data: course,
              });
            }
          });
        }
      }

      if (!isModuleAvailable) {
        console.log("Error in finding module.");
        return res.status(404).json({
          message: `Module with id: ${moduleId} not found.`,
        });
      }
    }
  });
};

// get all courses
exports.getAllCourses = (req, res) => {
  Course.find({}).exec((err, course) => {
    if (err) {
      return res.status(400).json({
        message: error,
      });
    }

    if (course) {
      return res.status(200).json({
        data: course,
      });
    }
  });
};
