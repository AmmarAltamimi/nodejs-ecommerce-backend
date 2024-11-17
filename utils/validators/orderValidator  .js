const {check} = require('express-validator');
const {validatorMiddleware} = require("../../middlewars/validatorMiddleware");
const Cart = require("../../models/cartModel")
const{isRefBelongsToModel} = require("./customValidator");
const User = require("../../models/userModel");

exports.createCashOrderValidator = [
check("cartId")
.notEmpty().withMessage("cartId required")
.isMongoId().withMessage('Invalid cart id format')
.custom((val,{req})=>isRefBelongsToModel(val,req,Cart)),
check("shippingAddress")
.notEmpty().withMessage("shippingAddress is required")
.custom(async(shippingAddress,{req})=> {
    const user = await User.findById(req.user._id);
        const isShippingAddressExists = user.addresses.some((address)=> address.alias === shippingAddress.alias && address.details === shippingAddress.details && address.phone === shippingAddress.phone && address.city === shippingAddress.city && address.postalCode === shippingAddress.postalCode);
        if(!isShippingAddressExists){
            throw new Error("Invalid shipping address");
        }
    return true;
})
    ,validatorMiddleware
]




exports.updateOrderToPaidValidator = [
    check("id")
    .isMongoId().withMessage('Invalid order id format')
    ,validatorMiddleware
]
    
    


    exports.updateOrderToDeliveredValidator = [
        check("id")
        .isMongoId().withMessage('Invalid order id format')
        ,validatorMiddleware
    ]

    exports.getOrderValidator = [
       check("id")
        .isMongoId().withMessage('Invalid order id format')
        ,validatorMiddleware
    ]


    exports.checkoutSessionValidator =  [
    check("cartId")
    .notEmpty().withMessage("cartId required")
    .isMongoId().withMessage('Invalid cart id format')
    .custom((val,{req})=>isRefBelongsToModel(val,req,Cart)),
    check("shippingAddress")
    .notEmpty().withMessage("shippingAddress is required")
    .custom(async(shippingAddress,{req})=> {
        const user = await User.findById(req.user._id);
            const isShippingAddressExists = user.addresses.some((address)=> address.alias === shippingAddress.alias && address.details === shippingAddress.details && address.phone === shippingAddress.phone && address.city === shippingAddress.city && address.postalCode === shippingAddress.postalCode);
            if(!isShippingAddressExists){
                throw new Error("Invalid shipping address");
            }
        return true;
    })
        ,validatorMiddleware
    ]