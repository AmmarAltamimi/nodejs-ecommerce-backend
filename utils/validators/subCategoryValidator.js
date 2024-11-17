const {check,body} = require('express-validator');
const {validatorMiddleware} = require("../../middlewars/validatorMiddleware");
const SubCategory = require("../../models/subCategoryModel")
const Category = require("../../models/categoryModel")
const {valueAlreadyExists,setSlug,isRefBelongsToModel} = require("./customValidator");





exports.createSubCategoryValidator = [
    check("name")
    .notEmpty().withMessage("subCategory name required")
    .isLength({min:2}).withMessage("too short subCategory name")
    .isLength({max:32}).withMessage("too long subCategory name")
    .custom((val,{req})=>valueAlreadyExists(val,req,SubCategory)).custom((val,{req})=>setSlug(val,req))
    ,
    check("category")
    .notEmpty().withMessage("category required")
    .isMongoId().withMessage('Invalid category id format')
    .custom((val,req)=>isRefBelongsToModel(val,req,Category))


    ,validatorMiddleware
]




exports.updateSubCategoryValidator = [
    check("id")
    .isMongoId().withMessage('Invalid subCategory id format'),
    check("name")
    .optional()
    .isLength({min:2}).withMessage("too short subCategory name")
    .isLength({max:32}).withMessage("too long subCategory name")
    .custom((val,{req})=>valueAlreadyExists(val,req,SubCategory)).custom((val,{req})=>setSlug(val,req)),
    body("category")
    .optional()
    .isMongoId().withMessage('Invalid category id format')
    .custom((val,req)=>isRefBelongsToModel(val,req,Category))



    ,validatorMiddleware
]


exports.putSubCategoryValidator = [
    check("id")
    .isMongoId().withMessage('Invalid subCategory id format')

    ,validatorMiddleware
]


exports.deleteSubCategoryValidator = [
    check("id")
    .isMongoId().withMessage('Invalid subCategory id format')

    ,validatorMiddleware
]


exports.getSubCategoryValidator = [
    check("id")
    .isMongoId().withMessage('Invalid subCategory id format')

    ,validatorMiddleware
]