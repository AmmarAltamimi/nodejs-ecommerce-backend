const express = require("express");

const router = express.Router();

const {
  getLoggedUserCart,
  addProductToCart,
  clearCart,
  updateCartItemQuantity,
  removeSpecificCartItem,
  applyCoupon,
} = require("../services/cartService");
const {
  addProductToCartValidator,
  updateCartItemQuantityValidator,
  removeSpecificCartItemValidator,
  applyCouponValidator,
} = require("../utils/validators/cartValidator");

const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

router
  .route("/")
  .get(protect, allowedTo("user"), getLoggedUserCart)
  .post(protect, allowedTo("user"), addProductToCartValidator, addProductToCart)
  .delete(protect, allowedTo("user"), clearCart);

router
  .route("/applyCoupon")
  .get(protect, allowedTo("user"), applyCouponValidator, applyCoupon);

router
  .route("/:productId")
  .put(
    protect,
    allowedTo("user"),
    updateCartItemQuantityValidator,
    updateCartItemQuantity
  )
  .delete(
    protect,
    allowedTo("user"),
    removeSpecificCartItemValidator,
    removeSpecificCartItem
  );

module.exports = router;
