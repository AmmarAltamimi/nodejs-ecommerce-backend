const express = require("express");

const router = express.Router();

const {
  getWishlists,
  addToWishlist,
  deleteWishlist,
} = require("../services/wishlistService");
const {
  createWishlistValidator,
  deleteWishlistValidator,
} = require("../utils/validators/wishlistValidator");
const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

router.route("/").get(protect, allowedTo("user"), getWishlists);
router
  .route("/:productId")
  .post(protect, allowedTo("user"), createWishlistValidator, addToWishlist)
  .delete(protect, allowedTo("user"), deleteWishlistValidator, deleteWishlist);

module.exports = router;
//commit g