const express = require("express");

const router = express.Router();

const {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  uploadBrandImage,
  uploadBrandImageToCloudinary,
} = require("../services/brandService ");

const {
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
  getBrandValidator,
} = require("../utils/validators/brandValidator ");
const {
  validateActualTypeAndCleanFileSingleImage,
} = require("../middlewares/uploadImageMiddleware");
const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

router
  .route("/")
  .get(getBrands)
  .post(
    protect,
    allowedTo("admin"),
    uploadBrandImage,
    createBrandValidator,
    validateActualTypeAndCleanFileSingleImage,
    uploadBrandImageToCloudinary,
    createBrand
  );
router
  .route("/:id")
  .put(
    protect,
    allowedTo("admin"),
    uploadBrandImage,
    updateBrandValidator,
    validateActualTypeAndCleanFileSingleImage,
    uploadBrandImageToCloudinary,
    updateBrand
  )
  .delete(protect, allowedTo("admin"), deleteBrandValidator, deleteBrand)
  .get(getBrandValidator, getBrand);

module.exports = router;
