const express = require("express");

const router = express.Router();

const {
  getProducts,
  getProductsWithItsDefaultVariant,
  createProduct,
  updatedProduct,
  // updateProductVariant,
  deleteProduct,
  getProduct,
  uploadProductImagePart1,
  uploadProductImagePart2,
  uploadProductImagesToCloudinary,
} = require("../services/productService");
const {
  applyCreateValidations,
  applyUpdateValidations,
  // updatedProductValidator,
  deleteProductValidator,
  getProductValidator,
} = require("../utils/validators/productValidator  ");
const {
  validateActualTypeAndCleanFileMixOfImages,
} = require("../middlewares/uploadImageMiddleware");
const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

const reviewRouter = require("./reviewRoute");

router.use("/:productId/reviews", reviewRouter);



router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    allowedTo("seller"),
    uploadProductImagePart1,
    uploadProductImagePart2,
    applyCreateValidations,
    validateActualTypeAndCleanFileMixOfImages("variant"),
    uploadProductImagesToCloudinary("variant"),
    createProduct
  );
  
  router.route("/default").get(getProductsWithItsDefaultVariant)

router
  .route("/:id")
  .put(
    protect,
    allowedTo("seller"),
    uploadProductImagePart1,
    uploadProductImagePart2,
    applyUpdateValidations,
    validateActualTypeAndCleanFileMixOfImages("variant"),
    uploadProductImagesToCloudinary("variant"),
    updatedProduct
  )
  .delete(protect, allowedTo("seller"), deleteProductValidator, deleteProduct)

  router.route("/:id/:variantId").get(getProductValidator, getProduct)

// router
//   .route("/:id/variant")
//   .put(
//     protect,
//     allowedTo("admin", "manager"),
//     applyUpdateValidations,
//     updateProductVariant
//   );

module.exports = router;
