/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const FileType = require('file-type')
const asyncHandler = require("express-async-handler");


const ApiError = require("../utils/apiError");
const {CanvasToGenerateImage} = require("../utils/generateDefaultImage");

// Define whitelist mime type

const whitelist = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
]


// Multer configuration for file uploads
const multerOptions = (collectionName) => {
  // diskStorage or memoryStorage

  const multerStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null, path.join("uploads",collectionName));
    },
    filename:(req,file,cb)=>{
        const filename = `${collectionName}-${uuidv4()}-${Date.now()}.jpeg`;
      cb(null,filename);
    },
  });

  // Filter to only allow image files
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image") && whitelist.includes(file.mimetype.trim().toLowerCase())) {
        cb(null, true);

    } else {
      cb(new ApiError("only PNG and JPEG images allowed ", 400), false);
    }
  };

    //determines the size of the image
  // limits = { fileSize: 1000000 }

// find uploaded files
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

// Helper function to upload a single image
exports.uploadSingleImage = (collectionName,fileName) => multerOptions(collectionName).single(fileName);

// Helper function to upload multiple image files
exports.uploadMixOfImages = (collectionName,arrayOfFields) => multerOptions(collectionName).fields(arrayOfFields);


exports.validateActualTypeAndCleanFileSingleImage = asyncHandler(async (req, res, next) => {

  if(!req.file){
    return next();
  }
  const meta = await FileType.fromFile(req.file.path);

  if (!whitelist.includes(meta.mime)) {
     fs.unlinkSync(req.file.path); // Remove file if validation fails
    throw new ApiError('file is not allowed',400);
  }

  next();
}
)

exports.validateActualTypeAndCleanFileMixOfImages =asyncHandler(async (req, res, next) => {

  if(!req.files){
    return next();
  }

  if(req.files.imageCover){

    const metaImageCover = await FileType.fromFile(req.files.imageCover[0].path);
    if (!whitelist.includes(metaImageCover.mime)) {
        fs.unlinkSync(req.files.imageCover[0].path); // Remove file if validation fails
        throw new ApiError('file is not allowed',400) 
    }
    
  }  


  if(req.files.images){
    await Promise.all(req.files.images.map(async(image)=>{
      const  metaImages = await FileType.fromFile(image.path);
      if (!whitelist.includes(metaImages.mime)) {
          fs.unlinkSync(image.path); // Remove file if validation fails
          throw new ApiError('file is not allowed',400)
        }
      
    }))
  }

  next();

 } 
) 
exports.userDefaultImage = 
    async (req, res,next) => {
     if (!req.file) {
      req.file = {};
      req.file.path = await CanvasToGenerateImage(req.body.name);
    } 
    next()

}


