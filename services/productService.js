const Product = require("../models/productModel");

const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewars/handlersFactoryMiddleware");

exports.getProducts = getAll(Product);

exports.createProduct = createOne(Product);

exports.updatedProduct = updateOne(Product);

exports.deleteProduct = deleteOne(Product);

exports.getProduct = getOne(Product,"reviews");
