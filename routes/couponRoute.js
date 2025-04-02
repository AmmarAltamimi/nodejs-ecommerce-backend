const express = require("express");

const router = express.Router();

const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCoupon,
} = require("../services/couponService");

const {
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
  getCouponValidator,
} = require("../utils/validators/couponValidator");
const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

router
  .route("/")
  .get(protect, allowedTo("seller"), getCoupons)
  .post(
    protect,
    allowedTo("seller"),
    createCouponValidator,
    createCoupon
  );
router
  .route("/:id")
  .put(
    protect,
    allowedTo("seller"),
    updateCouponValidator,
    updateCoupon
  )
  .delete(
    protect,
    allowedTo("seller"),
    deleteCouponValidator,
    deleteCoupon
  )
  .get(protect, allowedTo("seller"), getCouponValidator, getCoupon);

module.exports = router;
