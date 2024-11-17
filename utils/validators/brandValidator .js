const {check} = require('express-validator');
const {validatorMiddleware} = require("../../middlewars/validatorMiddleware");
const Brand = require("../../models/brandModel")
const{valueAlreadyExists,setSlug} = require("./customValidator");

exports.createBrandValidator = [
check("name")
.notEmpty().withMessage("brand required")
.isLength({min:3}).withMessage("too short brand name")
.isLength({max:32}).withMessage("too long brand name")
.custom((val,{req})=>valueAlreadyExists(val,req,Brand)).custom((val,{req})=>setSlug(val,req))
    ,validatorMiddleware
]




exports.updateBrandValidator = [
check("id")
.isMongoId().withMessage('Invalid brand id format'),
check("name")
.optional()
    .isLength({min:3}).withMessage("too short brand name")
    .isLength({max:32}).withMessage("too long brand name")
    .custom((val,{req})=>valueAlreadyExists(val,req,Brand)).custom((val,{req})=>setSlug(val,req))
        ,validatorMiddleware
    ]
    


    exports.deleteBrandValidator = [
        check("id")
        .isMongoId().withMessage('Invalid brand id format')
        ,validatorMiddleware
    ]

    exports.getBrandValidator = [
       check("id")
        .isMongoId().withMessage('Invalid brand id format')
        ,validatorMiddleware
    ]

