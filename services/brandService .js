const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const Brand = require("../models/brandModel");
const { uploadSingleImage } = require("../middlewars/uploadImageMiddleware");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewars/handlersFactoryMiddleware");

exports.uploadBrandImage = uploadSingleImage("image");
const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/brands/${filename}`);
  }
  next();
});

exports.getBrands = getAll(Brand);

exports.createBrand = createOne(Brand);

exports.updateBrand = updateOne(Brand);

exports.deleteBrand = deleteOne(Brand);

exports.getBrand = getOne(Brand);
