const slugify = require("slugify");
const Category = require("../models/categories");

// --- helper function for getCategory ---
// creates recursive category list (nested list)
const createCatList = (categories, parentId = null) => {
  const categoryList = [];
  let tempCatList;
  if (parentId == null) {
    tempCatList = categories.filter((cat) => cat.parentId == undefined);
  } else {
    tempCatList = categories.filter((cat) => cat.parentId == parentId);
  }

  for (let cate of tempCatList) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      parentId: cate.parentId,
      type: cate.type,
      children: createCatList(categories, cate._id),
    });
  }

  return categoryList;
};

// add new category
exports.addCategory = async (req, res) => {
  const categoryObj = {
    categoryName: req.body.categoryName,
    slug: `${slugify(req.body.categoryName)}`,
  };

  if (req.file) {
    categoryObj.categoryImage = "/public/" + req.file.filename;
  }

  if (req.body.parentId) {
    categoryObj.parentId = req.body.parentId;
  }

  const cat = new Category(categoryObj);
  cat.save((error, category) => {
    if (error) return res.status(400).json({ error });
    if (category) {
      return res.status(201).json({ category });
    }
  });
};

// get list of all categories
exports.getCategories = (req, res) => {
  Category.find({}).exec((err, categories) => {
    if (err) {
      return res.status(400).json({
        error: error,
      });
    }

    if (categories) {
      // recursive function to fetch all categories
      const categoryList = createCatList(categories);

      return res.status(200).json({
        data: categoryList,
      });
    }
  });
};