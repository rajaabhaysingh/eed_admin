const Course = require("../models/course");
const Category = require("../models/categories");
const Videos = require("../models/videos");
const slugify = require("slugify");
const fs = require("fs");
const path = require("path");

// create new course without adding any modules/contents
exports.createCourse = async (req, res) => {
  // destructuring form data first
  const {
    name,
    category,
    price,
    desc,
    level,
    prerequisites,
    offer,
    features,
    instructors,
    outline,
  } = req.body;

  // if course with same name already exists
  await Course.findOne({ slug: slugify(name) }).exec(async (err, course) => {
    if (err) {
      return res.status(400).json({
        error: "Something went wrong. Please try again later.",
      });
    }

    if (course) {
      return res.status(400).json({
        error: `Course with name "${name}" already exists. You cannot have two courses with exactly same name.`,
      });
    } else {
      // if supplied category is okay
      await Category.findOne({ _id: category }).exec((err, cat) => {
        if (err) {
          return res.status(404).json({
            error: "Provided category does not exist.",
          });
        } else {
          if (cat) {
            // --- proceed next ---

            // instructors operations
            let instructorsList = [];

            if (instructors) {
              try {
                instructorsList = JSON.parse(instructors);
              } catch (error) {
                return res.status(400).json({
                  error: "Invalid/malformed instructors value.",
                });
              }
            }

            // features operations
            let featuresList = [];

            if (features) {
              try {
                featuresList = JSON.parse(features);
              } catch (error) {
                return res.status(400).json({
                  error: "Invalid/malformed features value.",
                });
              }
            }

            // outline operations
            let outlineList = [];

            if (outline) {
              try {
                outlineList = JSON.parse(outline);
              } catch (error) {
                return res.status(400).json({
                  error: "Invalid/malformed outline value.",
                });
              }
            }

            const NewCourse = new Course({
              name: name,
              slug: slugify(name),
              category: category,
              price: price,
              desc: desc,
              level: level,
              prerequisites: prerequisites,
              offer: offer,
              instructors: instructorsList,
              features: featuresList,
              outline: outlineList,
              createdBy: req.user._id,
              thumbnail: req.file ? "/static/" + req.file.filename : "",
            });

            NewCourse.save((error, course) => {
              if (error) return res.status(400).json({ error: error });

              if (course) {
                return res.status(201).json({
                  data: course,
                });
              } else {
                return res.status(400).json({
                  error:
                    "Some unexpected error occured. Please contact developer if problem persists. [code: 400]",
                });
              }
            });
          } else {
            return res.status(404).json({
              error: "Provided course-category could not be found. [code: 404]",
            });
          }
        }
      });
    }
  });
};

// add modules to already added course
exports.addCourseModule = async (req, res) => {
  let { courseId, moduleNo, moduleName } = req.body;

  const addedBy = req.user._id;

  await Course.findOne({ _id: courseId }).exec((err, course) => {
    if (err) {
      console.log("Error in finding course: ", err);
      return res.status(400).json({
        error: err,
      });
    }

    if (course) {
      if (course.modules && course.modules.length > 0) {
        for (let module of course.modules) {
          if (module.moduleNo == moduleNo) {
            return res.status(400).json({
              error: `Module number ${moduleNo} already exists. Please enter a different number.`,
            });
          }
        }
      }
      course.modules.push({
        moduleNo,
        moduleName,
        addedBy: addedBy,
      });
      course.save((error, updatedCourse) => {
        if (error) return res.status(400).json({ error: error });

        if (course) {
          res.status(201).json({
            data: updatedCourse,
          });
        } else {
          return res.status(400).json({
            error:
              "Some unexpected error occured. Please contact developer if problem persists. [code: 400]",
          });
        }
      });
    } else {
      return res.status(404).json({
        error: "Provided course doesn't exist. [code: 404]",
      });
    }
  });
};

// add content to already added module
exports.addModuleContent = async (req, res) => {
  const {
    courseId,
    moduleId,
    priority,
    topicName,
    duration,
    desc,
    programs,
  } = req.body;

  const addedBy = req.user._id;

  await Course.findOne({ _id: courseId }).exec(async (err, course) => {
    if (err) {
      console.log(err);
      console.log("Error in finding course: ", err);
      return res.status(404).json({
        error: `Course with id: ${courseId} not found.`,
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

          // parse programs
          let progList = [];

          if (programs && programs.length > 0) {
            try {
              progList = JSON.parse(programs);
            } catch (error) {
              return res.status(400).json({
                error: "Malformed programs submitted",
              });
            }
          }

          // --- manage media file operations ---
          let mediaFile = "";
          let videoId = null;

          // check if request have some media files
          if (req.file) {
            mediaFile = req.file.filename;

            const videoObject = {
              courseId: course._id,
              filename: mediaFile,
            };

            const media = new Videos(videoObject);

            media.save(async (error, video) => {
              if (error) {
                return res.status(400).json({
                  error: error,
                  // "Error saving video file. Contact developer if problem persists.",
                });
              }

              if (video) {
                videoId = video._id;

                // do content push
                await course.modules[i].content.push({
                  priority,
                  topicName,
                  duration,
                  desc,
                  media: videoId,
                  programs: progList,
                  addedBy: addedBy,
                });

                course.save((error, course) => {
                  if (error) return res.status(400).json({ error: error });

                  if (course) {
                    return res.status(201).json({
                      data: course,
                    });
                  }
                });
              } else {
                return res.status(400).json({
                  error:
                    "Some unexpected error occured. Please contact developer if problem persists. [code: 400]",
                });
              }
            });
          } else {
            // --- if no media content was received ---
            // do content push
            await course.modules[i].content.push({
              priority,
              topicName,
              duration,
              desc,
              media: videoId,
              programs: progList,
              addedBy: addedBy,
            });

            course.save((error, course) => {
              if (error) return res.status(400).json({ error: error });

              if (course) {
                return res.status(201).json({
                  data: course,
                });
              } else {
                return res.status(400).json({
                  error:
                    "Some unexpected error occured. Please contact developer if problem persists. [code: 400]",
                });
              }
            });
          }
        }
      }

      if (!isModuleAvailable) {
        return res.status(404).json({
          error: `Module with id: ${moduleId} not found.`,
        });
      }
    } else {
      return res.status(404).json({
        error: "Provided module wasn't available on pur server. [code: 404]",
      });
    }
  });
};

// addCourseExercise
exports.addCourseExercise = async (req, res) => {
  const { courseId, name, desc, problems } = req.body;

  // question, options, answer, explanation, programs;

  const addedBy = req.user._id;

  await Course.findOne({ _id: courseId }).exec(async (err, course) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    // parse problems array
    const tempProblemArray = [];
    if (problems) {
      try {
        tempProblemArray = JSON.parse(problems);
      } catch (error) {
        return res.status(400).json({
          error: error,
        });
      }
    }

    if (course) {
      const exerciseObj = {
        name: name,
        desc: desc,
        addedBy: addedBy,
      };

      if (tempProblemArray && tempProblemArray.length > 0) {
        exerciseObj.questions = tempProblemArray;

        course.problems.push(exerciseObj);

        course.save((err, savedCourse) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }

          if (savedCourse) {
            return res.status(201).json({
              data: savedCourse,
            });
          } else {
            return res.status(400).json({
              error:
                "Some unexpected error occured. Please contact developer if problem persists. [code: 400]",
            });
          }
        });
      } else {
        return res.status(400).json({
          error:
            "Cannot save empty exercise. It must have some question/answers attached.",
        });
      }
    }
  });
};

// get all courses
exports.getAllCourses = async (req, res) => {
  await Course.find({})
    .select("_id name category level slug price desc thumbnail ratings")
    .populate("category")
    .exec((err, course) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (course) {
        return res.status(200).json({
          data: course,
        });
      } else {
        return res.status(404).json({
          error:
            "Requested content could not be found on our server. [code: 404]",
        });
      }
    });
};

// getCourseById
exports.getCourseById = async (req, res) => {
  await Course.findOne({ _id: req.params.courseId })
    .populate({ path: "category", select: "_id categoryName" })
    .exec((err, course) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      if (course) {
        return res.status(200).json({
          data: course,
        });
      } else {
        return res.status(404).json({
          error:
            "Requested course could not be found on our server. [code: 404]",
        });
      }
    });
};

// getCourseByCourseSlug
exports.getCourseByCourseSlug = async (req, res) => {
  await Course.findOne({ slug: req.params.courseSlug })
    .populate("category reviews")
    .exec((err, course) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      const {
        _id,
        name,
        category,
        level,
        slug,
        price,
        desc,
        isFreezed,
        prerequisites,
        offer,
        thumbnail,
        features,
        outline,
        instructors,
        faqs,
        createdBy,
        noOfEnrollments,
        reviews,
        ratings,
        lastUpdated,
        createdAt,
      } = course;

      if (course) {
        return res.status(200).json({
          data: {
            _id,
            name,
            category,
            level,
            slug,
            price,
            desc,
            isFreezed,
            prerequisites,
            offer,
            thumbnail,
            features,
            outline,
            instructors,
            faqs,
            createdBy,
            noOfEnrollments,
            reviews,
            ratings,
            lastUpdated,
            createdAt,
          },
        });
      } else {
        return res.status(404).json({
          error:
            "Requested course could not be found on our server. [code: 404]",
        });
      }
    });
};

// getVideoById
exports.getVideoById = async (req, res) => {
  await Videos.findOne({ _id: req.params.videoId }).exec((err, video) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    if (video) {
      const filePath = `${path.join(
        path.join(path.dirname(__dirname), "course_contents"),
        video.filename
      )}`;

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    } else {
      return res.status(404).json({
        error:
          "Requested video content could not be found on our server. [code: 404]",
      });
    }
  });
};

// getCoursesByCategorySlug
exports.getCoursesByCategorySlug = async (req, res) => {
  const { categorySlug } = req.params;

  await Category.findOne({ slug: categorySlug })
    .select("_id categoryName")
    .exec(async (err, cat) => {
      if (err) {
        return res.status(404).json({
          error: err,
        });
      }

      if (cat) {
        await Course.find({ category: cat._id })
          .populate({ path: "category", select: "_id slug" })
          .select("_id name category level slug price desc thumbnail ratings")
          .exec(async (error, courses) => {
            if (error) {
              return res.status(400).json({
                error: error,
              });
            }

            if (courses) {
              return res.status(200).json({
                data: {
                  name: cat.categoryName,
                  allCourses: courses,
                  freeCourses: courses.filter((course) => course.price <= 0),
                },
              });
            }
          });
      } else {
        return res.status(404).json({
          error:
            "Requested category content could not be found on our server. [code: 404]",
        });
      }
    });
};
