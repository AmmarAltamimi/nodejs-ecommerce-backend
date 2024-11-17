const {check} = require('express-validator');
const {validatorMiddleware} = require("../../middlewars/validatorMiddleware");
const Product = require("../../models/productModel")
const{isRefBelongsToModel} = require("./customValidator");



    exports.createWishlistValidator = [
       check("productId")
        .isMongoId().withMessage('Invalid product id format')
        .custom((val,{req})=>isRefBelongsToModel(val,req,Product))
        ,validatorMiddleware
    ]


    exports.deleteWishlistValidator = [
        check("productId")
         .isMongoId().withMessage('Invalid product id format')
         .custom((val,{req})=>isRefBelongsToModel(val,req,Product))
         ,validatorMiddleware
     ]
 