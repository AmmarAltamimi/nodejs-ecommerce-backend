const { validationResult } = require("express-validator");
const fs = require("fs");

   // Delete all uploaded images on error
 function DeleteUploadedFile(req,res,next){

  if (req.file) fs.unlinkSync(req.file.path);

  if(req.files){

    if(req.files.imageCover ) fs.unlinkSync(req.files.imageCover[0].path) 
    if(req.files.images){
        req.files.images.forEach(image => fs.unlinkSync(image.path))  
      } 

      if(req.body.variant) {

        req.body.variant.forEach((_,i) => {
          if(req.files[`variant[${i}][imageCover]`]) fs.unlinkSync(req.files[`variant[${i}][imageCover]`][0].path)
            if(req.files[`variant[${i}][images]`] ){
              req.files[`variant[${i}][images]`].forEach(image => fs.unlinkSync(image.path)) 
            } 
  
        })

      }
 
    

    }
  }

 



// Validation middleware to check request validation errors
exports.validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
   // Delete all uploaded images on error
    DeleteUploadedFile(req,res,next)

    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

