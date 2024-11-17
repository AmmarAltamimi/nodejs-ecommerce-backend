const SubCategory = require("../models/subCategoryModel");

exports.createFilterObj = async (req, res, next) => {
 
  if (req.params.categoryId) {
    req.filterObj = { category: req.params.categoryId };
  }
  next();
};

exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) {
    req.body.category = req.params.categoryId;
  }
  next();
};

const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewars/handlersFactoryMiddleware");

exports.getSubCategories = getAll(SubCategory);

exports.createSubCategory = createOne(SubCategory);

exports.updateSubCategory = updateOne(SubCategory);

exports.deleteSubCategory = deleteOne(SubCategory);

exports.getSubCategory = getOne(SubCategory);
