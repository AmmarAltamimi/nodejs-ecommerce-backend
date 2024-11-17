const {check} = require('express-validator');
const {validatorMiddleware} = require("../../middlewars/validatorMiddleware");
const Coupon = require("../../models/couponModel")
const{valueAlreadyExists} = require("./customValidator");

exports.createCouponValidator = [
check("name")
.notEmpty().withMessage("coupon required")
.isLength({min:2}).withMessage("too short coupon name")
.isLength({max:50}).withMessage("too long coupon name")
.custom((val,{req})=>valueAlreadyExists(val,req,Coupon)),
check("expire")
.isDate({ format: 'MM/DD/YYYY' }).withMessage("coupon is Date")
.isAfter(new Date().toISOString()).withMessage('Expiration date must be after the current date')
.notEmpty().withMessage("expire date required"),
check("discount")
.isInt({min:0,max:100}).withMessage("discount percentage must be betwenn 0 and 100")
.notEmpty().withMessage("discount percentage required")
    ,validatorMiddleware
]



exports.updateCouponValidator = [
    check("id")
    .isMongoId().withMessage('Invalid Coupon id format'),
    check("name")
    .optional()
    .isLength({min:2}).withMessage("too short coupon name")
    .isLength({max:50}).withMessage("too long coupon name")
    .custom((val,{req})=>valueAlreadyExists(val,req,Coupon)),
    check("expire")
    .isDate({ format: 'MM/DD/YYYY' }).withMessage("coupon is Date")
    .isAfter(new Date().toISOString()).withMessage('Expiration date must be after the current date')
    .optional(),
    check("discount")
    .isInt({min:0,max:100}).withMessage("discount percentage must be betwenn 0 and 100")
    .optional()
        ,validatorMiddleware
    ]


    exports.deleteCouponValidator = [
        check("id")
        .isMongoId().withMessage('Invalid coupon id format')
        ,validatorMiddleware
    ]

    exports.getCouponValidator = [
       check("id")
        .isMongoId().withMessage('Invalid coupon id format')
        ,validatorMiddleware
    ]

