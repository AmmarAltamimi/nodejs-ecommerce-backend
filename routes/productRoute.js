const express = require("express");

const router = express.Router();

const {
  getProducts,
  createProduct,
  updatedProduct,
  deleteProduct,
  getProduct,
  uploadProductImage,
  uploadProductImagesToCloudinary
} = require("../services/productService");
const {
  createProductValidator,
  updatedProductValidator,
  deleteProductValidator,
  getProductValidator
} = require("../utils/validators/productValidator  ");
const {validateActualTypeAndCleanFileMixOfImages} = require("../middlewares/uploadImageMiddleware")
const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

const reviewRouter = require("./reviewRoute");

router.use("/:productId/reviews", reviewRouter);

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImage,
    createProductValidator,
    validateActualTypeAndCleanFileMixOfImages,
    uploadProductImagesToCloudinary,
    createProduct
  );
router
  .route("/:id")
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImage,
    updatedProductValidator,
    validateActualTypeAndCleanFileMixOfImages,
    uploadProductImagesToCloudinary,
    updatedProduct
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  )
  .get(getProductValidator, getProduct);

module.exports = router;
