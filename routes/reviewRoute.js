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
  createFilterObj,
  setProductIdAndUserIdToBody,
} = require("../services/reviewService");
const {
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
  getReviewValidator,
  validatorProductId,
} = require("../utils/validators/reviewValidator   ");

router
  .route("/")
  .get(protect, allowedTo("admin", "manager"), 
  validatorProductId,// validate product id in params
  createFilterObj,// get list of Reviews for specific product
   getReviews)
  .post(
    protect,
    allowedTo("user"),
    validatorProductId, // validate product id in params
    setProductIdAndUserIdToBody, // create Reviews for specific product or  create Reviews for My user 
    createReviewValidator,
     
    createReview
  );
router
  .route("/:id")
  .put(protect, allowedTo("user"), updateReviewValidator, updateReview)
  .delete(
    protect,
    allowedTo("admin", "manager", "user"),
    deleteReviewValidator,
    deleteReview
  )
  .get(getReviewValidator, getReview);

module.exports = router;
