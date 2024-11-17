const {check} = require('express-validator');
const {validatorMiddleware} = require("../../middlewars/validatorMiddleware");
const Product = require("../../models/productModel")
const{isRefBelongsToModel} = require("./customValidator");

exports.addProductToCartValidator = [
check("product")
.notEmpty().withMessage("productId required")
.isMongoId().withMessage('Invalid product id format')
.custom((val,{req})=>isRefBelongsToModel(val,req,Product))
    ,validatorMiddleware
]




exports.updateCartItemQuantityValidator = [
check("id")
.isMongoId().withMessage('Invalid product id format'),
check("quantity")
.notEmpty().withMessage("productId required")
.isInt().withMessage("product quantity is number")
        ,validatorMiddleware
    ]
    


    exports.removeSpecificCartItemValidator =  [
        check("id")
        .isMongoId().withMessage('Invalid product id format')
                ,validatorMiddleware
            ]

    exports.applyCouponValidator = [
       check("name")
        .notEmpty().withMessage("coupon name is required")
        ,validatorMiddleware
    ]

