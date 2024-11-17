const multer = require('multer');
const ApiError = require('../utils/apiError');

const multerOptions = ()=> {

const multerStorage =multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
if(file.mimetype.startWith("image")){
    cb(null,true)
}else{
    cb(new ApiError("only image allowed",400),false);
}

}

const upload = multer({storage:multerStorage,fileFilter:multerFilter})

return upload;

}



exports.uploadSingleImage = (fileName)=>multerOptions().single(fileName)



exports.uploadMixOfImages = (arrayOfFields)=>{
    multerOptions().fields(arrayOfFields)
}