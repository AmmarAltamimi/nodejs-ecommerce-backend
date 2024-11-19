const asyncHandler =require("express-async-handler");
const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel")
const Product = require("../models/productModel")
const Coupon = require("../models/couponModel")

function getTotalPrice(cart){
    let total = 0 ;
    cart.cartItem.forEach((item)=> {
        total += item.price * item.quantity
    })

    return total;

}



exports.getLoggedUserCart = asyncHandler(async(req,res,next)=>{
        const cart = await Cart.findOne({user:req.user._id}).populate({path:"cartItem.product",select:"title description"});
        if(!cart){
            return next(new ApiError(`Cart not found with id ${req.user._id}`,404));
        }
        res.status(200).json({status : "success",numOfCartItems:cart.cartItem.length,data:cart});
})


exports.addProductToCart = asyncHandler(async(req,res,next)=>{
    const product = await Product.findOne({id:req.body.product})

    let cart = await Cart.findOne({id: req.user._id});
    if(!cart){
        cart = await Cart.create({
            user:req.user._id,
            cartItem:[{
                product : req.body.product,
                price : product.price,
            }]
       })
    }
    console.log(cart)

    const findIndex = cart.cartItem.findIndex((item)=> item.product.toString() === req.body.product );
    if(findIndex > -1){
        cart.cartItem[findIndex].quantity +=1

    }else{
        cart.cartItem.push({product : req.body.product,price : product.price,});

    }

    // calculate the total price 
    cart.totalPrice = getTotalPrice(cart)


    const newCart = await cart.save();

    res.status(201).json({status : "success",numOfCartItems:cart.cartItem.length,data:newCart});

})



exports.clearCart =  asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOneAndDelete({user:req.user._id});
    if(!cart){
        return next(new ApiError(`Cart not found with id ${req.user._id}`,404));
    }

    res.status(200).json({status:"success",message:"Cart removed successfully"});


})



exports.updateCartItemQuantity = asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOne({user:req.user._id});
    if(!cart){
        return next(new ApiError(`Cart not found with id ${req.user._id}`,404));
    }
    
    const findIndex = cart.cartItem.findIndex((item)=> item._id.toString() === req.params.id);

    if(findIndex > -1){
        cart.cartItem[findIndex].quantity = req.body.quantity;
    }else{
        return next(new ApiError(`Item with id ${req.params.id} not found in cart`,404));
    }

   //calculate total price
   cart.totalPrice =getTotalPrice(cart)

    const updateCart = await cart.save();

    res.status(200).json({status:"success",data:updateCart});


})


exports.removeSpecificCartItem =  asyncHandler(async(req,res,next)=>{
    
    const cart = await Cart.findOneAndUpdate({user:req.user._id},{

        $pull:{cartItem:{_id:req.params.id}}

    },{new:true})

    if(!cart){
        return next(new ApiError(`Item with id ${req.params.id} not found in cart`,404));
    }

    
    //calculate total price 
    cart.totalPrice = getTotalPrice(cart)

    await cart.save();


    res.status(200).json({status:"success",numOfCartItems:cart.cartItem.length,message:"Item removed successfully from cart"});

})


exports.applyCoupon = asyncHandler(async(req,res,next)=>{
    const coupon = await Coupon.findOne({name:req.body.name,expire:{$gt:Date.now()}});
    if(!coupon){
        return next(new ApiError("Coupon not found",404));
    }

    const cart = await Cart.findOne({user:req.user._id});
    const couponDiscount = cart.totalPrice * (coupon.discount /100).toFixed(2); 
    cart.totalPriceAfterDiscount =cart.totalPrice- couponDiscount;

    const updateCart = await cart.save();

    res.status(200).json({status:"success",numOfCartItems:cart.cartItem.length,data:updateCart});


})

