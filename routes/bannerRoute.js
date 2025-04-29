const express = require("express");

const router = express.Router();

const {
  getBanners,
  updateBanner,
  setBannerIdToParams,
  uploadBannerImage,
} = require("../services/bannerService");

const {
updateBannerValidator
} = require("../utils/validators/bannerValidator");

const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");
const {
  validateArrayFileTypeAnyFileTypeDisk,uploadAnyImagesToCloudinaryDisk
} = require("../middlewares/uploadImageMiddleware");

// for fields Cloudinary
const fieldType = {
  "images" : "multi"
}


router
  .route("/")
  .get(getBanners)
  .put(
    protect,
    allowedTo("admin"),
    uploadBannerImage,
    setBannerIdToParams,
    (req,res,next)=>{console.log("1"); next()},

    updateBannerValidator,
    (req,res,next)=>{console.log("2"); next()},
    validateArrayFileTypeAnyFileTypeDisk,
    uploadAnyImagesToCloudinaryDisk("banner","auto",600,600,"fill",fieldType),
    updateBanner
  )

module.exports = router;
