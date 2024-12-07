const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Product = require("../models/productModel");

const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewares/handlersFactoryMiddleware");
const {uploadMixOfImages} = require("../middlewares/uploadImageMiddleware");
const cloudinary = require("../utils/cloudinary");
const ApiError = require("../utils/apiError");



exports.uploadProductImage = uploadMixOfImages("products",[{name:"imageCover",maxCount:1},{name:"images",maxCount:5}])


exports.uploadProductImagesToCloudinary = async(req,res,next)=>{
  // if updated  key not image so no req.file will be founded
  if(!req.files){
    return next();
  }


  if(req.files.imageCover){
    try {
      const customFileName = `product-${uuidv4()}-${Date.now()}-imageCover`;  // You can create your own naming scheme
  
      const result = await cloudinary.uploader.upload(req.files.imageCover[0].path,{
        folder: "products", // Optional: specify folder in Cloudinary
        public_id: customFileName,  // Set the custom name for the image
        quality: "auto", // Optional: set quality
        width: 600, // Optional: resize image width
        height: 600, // Optional: resize image height
        crop: "fill", // Optional: crop the image
      });
  
      req.body.imageCover =   {
        url: result.secure_url,       
        public_id: result.public_id,  
      };
  
    }catch(err){
      fs.unlinkSync(req.files.imageCover[0].path); // Remove local file after successful upload
        throw new ApiError(`Failed to upload  to cloudinary ${err.message}`,500);
  
    }
  }


  if(req.files.images){
    req.body.images =[]
    await Promise.all(req.files.images.map(async(image)=>{
      
      try {
        const customFileName = `product-${uuidv4()}-${Date.now()}`;  // You can create your own naming scheme
        const result = await cloudinary.uploader.upload(image.path,{
          folder: "products", // Optional: specify folder in Cloudinary
          public_id: customFileName,  // Set the custom name for the image
          quality: "auto", // Optional: set quality
          width: 600, // Optional: resize image width
          height: 600, // Optional: resize image height
          crop: "fill", // Optional: crop the image
        });
    
        req.body.images.push({
          url: result.secure_url,       
          public_id: result.public_id,  
        });
    
      }catch(err){
        fs.unlinkSync(image.path); // Remove local file after successful upload
          throw new ApiError(`Failed to upload  to cloudinary ${err.message}`,500);
    
      }

    }))


  }  

  next()

}

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = getAll(Product);

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private
exports.createProduct = createOne(Product);

// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updatedProduct = updateOne(Product);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = deleteOne(Product);

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = getOne(Product, "reviews");
