const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Category = require("../models/categoryModel");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewares/handlersFactoryMiddleware");
const {uploadSingleImage} = require("../middlewares/uploadImageMiddleware")
const cloudinary = require("../utils/cloudinary");
const ApiError = require("../utils/apiError");


exports.uploadCategoryImage = uploadSingleImage('categories','image');

exports.uploadCategoryImageToCloudinary = async(req,res,next)=>{
  // if updated  key not image so no req.file will be founded
  if(!req.file){
    return next();
  }   
  try {
    const customFileName = `category-${uuidv4()}-${Date.now()}`;  // You can create your own naming scheme

    const result = await cloudinary.uploader.upload(req.file.path,{
      folder: "categories", // Optional: specify folder in Cloudinary
      public_id: customFileName,  // Set the custom name for the image
      quality: "auto", // Optional: set quality
      width: 600, // Optional: resize image width
      height: 600, // Optional: resize image height
      crop: "fill", // Optional: crop the image
    });

    req.body.image =   {
      url: result.secure_url,       
      public_id: result.public_id,  
    };

    next()

  }catch(err){
    fs.unlinkSync(req.file.path); // Remove local file after successful upload
      return next(new ApiError(`Failed to upload  to cloudinary ${err.message}`,500));

  }

}

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = getAll(Category);

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private/Admin-Manager
exports.createCategory = createOne(Category);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin-Manager
exports.updateCategory = updateOne(Category);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = deleteOne(Category);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = getOne(Category);
