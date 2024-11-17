const {check} = require('express-validator');
const {validatorMiddleware} = require("../../middlewars/validatorMiddleware");
const User = require("../../models/userModel")
const{isRefBelongsToSubModel,valueAlreadyExistsInSubModel} = require("./customValidator");



    exports.createAddressValidator = [

       check("alias")
       .notEmpty().withMessage("alias is required")
       .isLength({min:2}).withMessage("too short alias address ")
       .isLength({max:10}).withMessage("too long alias address ")
        .custom(async(val,{req})=>valueAlreadyExistsInSubModel(val,req,User)),
        check("details")
        .notEmpty().withMessage("details is required")
        .isLength({min:2}).withMessage("too short details address ")
        .isLength({max:100}).withMessage("too long details address "),
        check("phone")
        .notEmpty().withMessage("phone number is required")
        .isMobilePhone(['ar-YE','ar-EG','ar-SA','en-IN']).withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),
        check("city")
        .notEmpty().withMessage("city is required")
        .isLength({min:2}).withMessage("too short city address ")
        .isLength({max:50}).withMessage("too long city address "),
        check("postalCode")
        .notEmpty().withMessage("postal code is required")
        .isPostalCode('US').withMessage("postal code is wrong")
        ,validatorMiddleware
    ]


    exports.deleteAddressValidator = [
        check("addressId")
         .isMongoId().withMessage('Invalid address id format')
         .custom((val,{req})=>isRefBelongsToSubModel(val,req,User))
         ,validatorMiddleware
     ]
 