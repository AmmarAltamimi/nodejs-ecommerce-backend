const {check} = require('express-validator');

const {validatorMiddleware} = require("../../middlewars/validatorMiddleware");
const Category = require('../../models/categoryModel');
const SubCategory = require('../../models/subCategoryModel');
const Brand = require('../../models/brandModel');
const {setSlug,isRefBelongsToModel,isPriceAfterDiscountLess,isArrayOfRefBelongsToModel,isSpecificModelBelongsToModel} = require("./customValidator");


exports.createProductValidator = [
check("title")
.notEmpty().withMessage("Product title required")
.isLength({min:2}).withMessage("too short product title")
.isLength({max:32}).withMessage("too long product title")
.custom((val,{req})=>setSlug(val,req))
,
check("description")
.notEmpty().withMessage("product description required")
.isLength({min:10}).withMessage("too short product description")
.isLength({max:500}).withMessage("too long product description"),
check("count")
.isInt().withMessage("count is number")
.notEmpty().withMessage("product count required"),
check("sold")
.optional()
.isInt().withMessage("sold is number"),
check("price")
.isFloat({max:20000}).withMessage("price must be less than 20000")
.notEmpty().withMessage("price required"),
check("priceAfterDiscount")
.optional()
.isFloat().withMessage("priceAfterDiscount is number")
.custom((val,{req})=>isPriceAfterDiscountLess(val,req)),
check("colors")
.isArray()
.optional(),
check("ratingsAverage")
.optional()
.isFloat({min:1,max:5}),
check("ratingsQuantity")
.optional()
.isInt(),
check("category")
.notEmpty().withMessage("category required")
.isMongoId().withMessage("Invalid category id format")
.custom((val,{req})=>isRefBelongsToModel(val,req,Category)),
check("subCategories")
.notEmpty().withMessage("subcategories required")
.isMongoId().withMessage("Invalid subCategory id format")
.custom((subcategoriesReceived,{req})=>isArrayOfRefBelongsToModel(subcategoriesReceived,req,SubCategory))
.custom(async(subcategoriesReceived,{req})=>isSpecificModelBelongsToModel(subcategoriesReceived,req,SubCategory,{category:req.body.category})),
check("brand")
.notEmpty().withMessage("brand required")
.isMongoId().withMessage("Invalid brand id format")   
 .custom((val,{req})=>isRefBelongsToModel(val,req,Brand))

    ,validatorMiddleware
]

exports.updatedProductValidator = [
    check("id")
    .isMongoId().withMessage('Invalid Product id format'),
    check("title")
    .optional()
    .isLength({min:2}).withMessage("too short product title")
    .isLength({max:32}).withMessage("too long product title")
    .custom((val,{req})=>setSlug(val,req))
    ,
    check("description")
    .optional()
    .isLength({min:10}).withMessage("too short product description")
    .isLength({max:500}).withMessage("too long product description"),
    check("count")
    .isInt().withMessage("count is number")
    .optional(),
    check("sold")
    .optional()
    .isInt().withMessage("sold is number"),
    check("price")
    .isFloat({max:20000}).withMessage("price must be less than 20000")
    .optional(),
    check("priceAfterDiscount")
    .optional()
    .isFloat().withMessage("priceAfterDiscount is number")
    .custom((val,{req})=>isPriceAfterDiscountLess(val,req)),
    check("colors")
    .isArray()
    .optional(),
    check("ratingsAverage")
    .optional()
    .isFloat({min:1,max:5}),
    check("ratingsQuantity")
    .optional()
    .isInt(),
    check("category")
    .optional()
    .isMongoId().withMessage("Invalid category id format")
    .custom((val,{req})=>isRefBelongsToModel(val,req,Category)),
    check("subCategories")
    .optional()
    .isMongoId().withMessage("Invalid subCategory id format")
    .custom((subcategoriesReceived,{req})=>isArrayOfRefBelongsToModel(subcategoriesReceived,req,SubCategory))
    .custom(async(subcategoriesReceived,{req})=>isSpecificModelBelongsToModel(subcategoriesReceived,req,SubCategory)),
    check("brand")
    .optional()
    .isMongoId().withMessage("Invalid brand id format")   
     .custom((val,{req})=>isRefBelongsToModel(val,req,Brand))
    
        ,validatorMiddleware
    ]
    





    exports.deleteProductValidator = [
        check("id")
        .isMongoId().withMessage('Invalid product id format')
        ,validatorMiddleware
    ]

    exports.getProductValidator = [
        check("id")
        .isMongoId().withMessage('Invalid product id format')
        ,validatorMiddleware
    ]

