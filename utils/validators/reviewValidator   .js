const {check} = require('express-validator');

const {validatorMiddleware} = require("../../middlewars/validatorMiddleware");
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const {isRefBelongsToModel,checkIfUserReviewedProduct,validateUserReviewOwnership} = require("./customValidator");


exports.createReviewValidator = [
check("title")
.notEmpty().withMessage("review title required")
.isLength({min:2}).withMessage("too short product title")
.isLength({max:32}).withMessage("too long product title"),
check("ratings")
.notEmpty().withMessage("ratings  required")
.isFloat({min:1,max:5}).withMessage("ratings between 1 and 5"),
check("user")
.isMongoId().withMessage("Invalid user id format")
.custom((val,{req})=>isRefBelongsToModel(val,req,User)),
check("product")
.notEmpty().withMessage("product required")
.isMongoId().withMessage("Invalid product id format")   
 .custom((val,{req})=>isRefBelongsToModel(val,req,Product))
 .custom(async(productId,{req})=> checkIfUserReviewedProduct(productId,req,Review))
,validatorMiddleware
]

exports.updateReviewValidator = [
    check("id")
    .isMongoId().withMessage('Invalid Review id format')
    .custom(async(reviewId,{req})=>validateUserReviewOwnership(reviewId,req,Review)),
    check("title")
    .optional()
    .isLength({min:2}).withMessage("too short review title")
    .isLength({max:32}).withMessage("too long review title"),
    check("ratings")
    .optional()
    .isFloat({min:1,max:5}),
    check("user")
    .optional()
    .isMongoId().withMessage("Invalid user id format")
    .custom((val,{req})=>isRefBelongsToModel(val,req,User)),
    check("product")
    .optional()
    .isMongoId().withMessage("Invalid product id format")   
     .custom((val,{req})=>isRefBelongsToModel(val,req,Product))
     .custom(async(productId,{req})=> checkIfUserReviewedProduct(productId,req,Review))
    ,validatorMiddleware
    ]
    


    exports.deleteReviewValidator = [
        check("id")
        .isMongoId().withMessage('Invalid Review id format')
        .custom(async(reviewId,{req})=>{
            if(req.user.role === "user"){
                console.log("im user")
               await validateUserReviewOwnership(reviewId,req,Review);
            }      
            return true;

        })
        ,validatorMiddleware
    ]

    exports.getReviewValidator = [
        check("id")
        .isMongoId().withMessage('Invalid Review id format')
        ,validatorMiddleware
    ]

