const Coupon = require("../models/couponModel");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewares/handlersFactoryMiddleware");

// @desc    Get list of coupons
// @route   GET /api/v1/coupons
// @access  Private/seller
exports.getCoupons = getAll(Coupon);

// @desc    Create coupon
// @route   POST  /api/v1/coupons
// @access  Private/seller
exports.createCoupon = createOne(Coupon);

// @desc    Update specific coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/seller
exports.updateCoupon = updateOne(Coupon);

// @desc    Delete specific coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/seller
exports.deleteCoupon = deleteOne(Coupon);

// @desc    Get specific coupon by id
// @route   GET /api/v1/coupons/:id
// @access  Private/seller
exports.getCoupon = getOne(Coupon);
