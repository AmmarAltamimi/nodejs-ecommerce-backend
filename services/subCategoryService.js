const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const SubCategory = require("../models/subCategoryModel");

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




exports.uploadSubCategoryImage = uploadSingleImage('subCategories','image');

exports.uploadSubCategoryImageToCloudinary = async(req,res,next)=>{
  // if updated  key not image so no req.file will be founded
  if(!req.file){
    return next();
  }   
  try {
    const customFileName = `subCategory-${uuidv4()}-${Date.now()}`;  // You can create your own naming scheme
    const result = await cloudinary.uploader.upload(req.file.path,{
      folder: "subCategories", // Optional: specify folder in Cloudinary
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






// Nested route (get)
exports.createFilterObj = async (req, res, next) => {
  if (req.params.categoryId) {
    req.filterObj = { category: req.params.categoryId };
  }
  next();
};

// Nested route (Create)
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) {
    req.body.category = req.params.categoryId;
  }
  next();
};

// @desc    Get list of subcategories
// @route   GET /api/v1/subcategories
// @access  Public
exports.getSubCategories = getAll(SubCategory);

// @desc    Create subCategory
// @route   POST  /api/v1/subcategories
// @access  Private/Admin
exports.createSubCategory = createOne(SubCategory);

// @desc    Update specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private/Admin
exports.updateSubCategory = updateOne(SubCategory);

// @desc    Delete specific subCategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private/Admin
exports.deleteSubCategory = deleteOne(SubCategory);

// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategory = getOne(SubCategory);
