const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const Brand = require("../models/brandModel");
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


exports.uploadBrandImage = uploadSingleImage('brands','image');
exports.uploadBrandImageToCloudinary = async(req,res,next)=>{
  // if updated  key not image so no req.file will be founded
  if(!req.file){
    return next();
  }   
  try {
    const customFileName = `brand-${uuidv4()}-${Date.now()}`;  // You can create your own naming scheme

    const result = await cloudinary.uploader.upload(req.file.path,{
      folder: "brands", // Optional: specify folder in Cloudinary
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




// @desc    Get list of brands
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = getAll(Brand);


// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private/Admin
exports.createBrand = createOne(Brand);

// @desc    Update specific brand
// @route   PUT /api/v1/brands/:id
// @access  Private/Admin
exports.updateBrand = updateOne(Brand);

// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private/Admin
exports.deleteBrand = deleteOne(Brand);

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = getOne(Brand);
