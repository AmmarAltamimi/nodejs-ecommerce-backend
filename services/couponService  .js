const Coupon = require("../models/couponModel");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewars/handlersFactoryMiddleware");

exports.getCoupons = getAll(Coupon);

exports.createCoupon = createOne(Coupon);

exports.updateCoupon = updateOne(Coupon);

exports.deleteCoupon = deleteOne(Coupon);

exports.getCoupon = getOne(Coupon);
