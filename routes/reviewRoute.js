const express = require("express");

const router = express.Router({ mergeParams: true }); // get  Category ID
const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
  updateLikesReview,
  createFilterObj,
  setProductIdAndUserIdToBody,
  uploadReviewImage,
  uploadReviewImagesToCloudinary,
} = require("../services/reviewService");
const {
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
  getReviewValidator,
  updateLikesReviewValidator,
  validatorProductId,
} = require("../utils/validators/reviewValidator   ");
const {
  validateActualTypeAndCleanFileMixOfImages,
} = require("../middlewares/uploadImageMiddleware");


router
  .route("/")
  .get(
    protect,
    allowedTo("admin"),
    validatorProductId, // validate product id in params
    createFilterObj, // get list of Reviews for specific product
    getReviews
  )
  .post(
    protect,
    allowedTo("user"),
    uploadReviewImage,
    validatorProductId, // validate product id in params
    setProductIdAndUserIdToBody, // create Reviews for specific product or  create Reviews for My user
    createReviewValidator,
    validateActualTypeAndCleanFileMixOfImages(false),
    uploadReviewImagesToCloudinary(false),
    createReview
  );
router
  .route("/:id")
  .put(
    protect,
    allowedTo("user"),
    uploadReviewImage,
    updateReviewValidator,
     validateActualTypeAndCleanFileMixOfImages(false),
     uploadReviewImagesToCloudinary(false),
    updateReview
  )
  .delete(
    protect,
    allowedTo("admin", "user"),
    deleteReviewValidator,
    deleteReview
  )
  .get(getReviewValidator, getReview);

  router.put("/:id/update-likes",
    protect,
    allowedTo("user"),
    updateLikesReviewValidator,
    updateLikesReview

  )

module.exports = router;
