const Category = require("../models/categoryModel");

const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewars/handlersFactoryMiddleware");

exports.getCategories = getAll(Category);

exports.createCategory = createOne(Category);

exports.updateCategory = updateOne(Category);

exports.deleteCategory = deleteOne(Category);

exports.getCategory = getOne(Category);
