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
      categoryName: cate.categoryName,
      slug: cate.slug,
      parentId: cate.parentId,
      type: cate.type,
      categoryImage: cate.categoryImage,
      children: createCatList(categories, cate._id),
      updatedAt: cate.updatedAt,
      createdAt: cate.createdAt,
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
    categoryObj.categoryImage = "/static/" + req.file.filename;
  }

  if (req.body.parentId) {
    categoryObj.parentId = req.body.parentId;
  }

  const cat = new Category(categoryObj);
  cat.save((error, category) => {
    if (error) return res.status(400).json({ error: error });
    if (category) {
      return res.status(201).json({ data: category });
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
