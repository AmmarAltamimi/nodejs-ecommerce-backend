const express = require('express');

const router = express.Router();

const {getCoupons,createCoupon,updateCoupon,deleteCoupon,getCoupon} = require("../services/couponService  ");

const {createCouponValidator,updateCouponValidator,deleteCouponValidator,getCouponValidator} = require("../utils/validators/couponValidator  ");
const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")



router.route("/").get(protect,allowedTo("admin","manager"),getCoupons).post(protect,allowedTo("admin","manager"),createCouponValidator,createCoupon);
router.route("/:id").put(protect,allowedTo("admin","manager"),updateCouponValidator,updateCoupon)
.delete(protect,allowedTo("admin","manager"),deleteCouponValidator,deleteCoupon)
.get(protect,allowedTo("admin","manager"),getCouponValidator,getCoupon)



module.exports = router;



