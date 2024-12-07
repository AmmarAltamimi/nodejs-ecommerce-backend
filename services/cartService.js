const asyncHandler =require("express-async-handler");
const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel")
const Product = require("../models/productModel")
const Coupon = require("../models/couponModel")


//validateAndApplyCoupon
async function validateAndApplyCoupon(cart,next){
    console.log("hello");
    if(cart.appliedCoupon){
        console.log("hello1");
        console.log(cart.appliedCoupon);
        
        const coupon = await Coupon.findOne({name:cart.appliedCoupon,expire:{$gt:Date.now()}});
        if(!coupon){
            cart.totalPriceAfterDiscount = undefined;
            return ;
        }

        const couponDiscount = cart.totalPrice * (coupon.discount /100).toFixed(2); 
        cart.totalPriceAfterDiscount =cart.totalPrice- couponDiscount;
       
       
    }

    
}

// getTotalPrice
async function getTotalPrice(cart){
    let total = 0 ;
    cart.cartItem.forEach((item)=> {
        total += item.price * item.quantity
    })
    cart.totalPrice = total
    await validateAndApplyCoupon(cart)

}

// to check  if there size available to increase the quantity
const checkSizeCount = async (req,res,next)=>{
    const {productId} = req.params
    const {colorWithSize,quantity} = req.body

    const product = await Product.findById(productId)
    const colorObj = product.colors.find((color)=> color.name === colorWithSize[0])
    if(!colorObj){
        throw new ApiError(`Color with size not available`,400);
    }
    const sizeObj = colorObj.sizes.find((size)=>  size.name === colorWithSize[1])
    if(!sizeObj) {
        throw new ApiError(`Size not available`,400);
    }

    if(sizeObj.count < quantity){
        throw new ApiError(`Not enough ${colorWithSize[1]} for ${colorWithSize[0]} in stock`,400);
        
    }

}



// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Private/User
exports.getLoggedUserCart = asyncHandler(async(req,res,next)=>{
        const cart = await Cart.findOne({user:req.user._id}).populate({path:"cartItem.product",select:"title description"});
        if(!cart){
            return next(new ApiError(`Cart not found with id ${req.user._id}`,404));
        }
        res.status(200).json({status : "success",numOfCartItems:cart.cartItem.length,data:cart});
})


// @desc    Add product to  cart
// @route   POST /api/v1/cart
// @access  Private/User
exports.addProductToCart = asyncHandler(async(req,res,next)=>{
    const product = await Product.findOne({id:req.body.product})

    let cart = await Cart.findOne({id: req.user._id});
    if(!cart){
        cart = await Cart.create({
            user:req.user._id,
            cartItem:[{
                product : req.body.product,
                price : product.price,
                colorWithSize:req.body.colorWithSize
            }],

       })
    }else{

        const findIndex = cart.cartItem.findIndex((item)=> item.product.toString() === req.body.product && item.colorWithSize === req.body.colorWithSize );
        if(findIndex > -1){
            cart.cartItem[findIndex].quantity +=1
    
        }else{
            cart.cartItem.push({product : req.body.product,price : product.price,});
    
        }
    }


    // calculate the total price 
    await getTotalPrice(cart)


    const newCart = await cart.save();

    res.status(201).json({status : "success",numOfCartItems:cart.cartItem.length,data:newCart});

})


// @desc    clear logged user cart
// @route   DELETE /api/v1/cart
// @access  Private/User
exports.clearCart =  asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOneAndDelete({user:req.user._id});
    if(!cart){
        return next(new ApiError(`Cart not found with id ${req.user._id}`,404));
    }

    res.status(200).json({status:"success",message:"Cart removed successfully"});


})


// @desc    Update specific cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private/User
exports.updateCartItemQuantity = asyncHandler(async(req,res,next)=>{ 
    const cart = await Cart.findOne({user:req.user._id});
    if(!cart){
        return next(new ApiError(`Cart not found with id ${req.user._id}`,404));
    }
    
 
    // to check  if there size available to increase the quantity
       await checkSizeCount(req,res,next)

    const findIndex = cart.cartItem.findIndex((item)=> item.product.toString() === req.params.productId);
    if(findIndex > -1){
        cart.cartItem[findIndex].quantity = req.body.quantity;
    }else{
        return next(new ApiError(`Item with id ${req.params.productId} not found in cart`,404));
    }

    // calculate the total price 
    await getTotalPrice(cart)


    const updateCart = await cart.save();

    res.status(200).json({status:"success",data:updateCart});


})


// @desc    Remove specific cart item
// @route   DELETE /api/v1/cart/:itemId
// @access  Private/User
exports.removeSpecificCartItem =  asyncHandler(async(req,res,next)=>{
    
    const cart = await Cart.findOneAndUpdate({user:req.user._id},{

        $pull:{cartItem:{_id:req.params.productId}}

    },{new:true})

    if(!cart){
        return next(new ApiError(`Item with id ${req.params.productId} not found in cart`,404));
    }

    
     // calculate the total price 
     await getTotalPrice(cart)


    await cart.save();


    res.status(200).json({status:"success",numOfCartItems:cart.cartItem.length,message:"Item removed successfully from cart"});

})


// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/cart/applyCoupon
// @access  Private/User
exports.applyCoupon = asyncHandler(async(req,res,next)=>{
    const coupon = await Coupon.findOne({name:req.body.name,expire:{$gt:Date.now()}});
    if(!coupon){
        return next(new ApiError("Coupon not found",404));
    }

    const cart = await Cart.findOne({user:req.user._id});
    if (!cart) {
        return next(new ApiError('Cart not found', 404));
      }

      cart.appliedCoupon = req.body.name;
      console.log(cart.appliedCoupon)
      
    const couponDiscount = cart.totalPrice * (coupon.discount /100).toFixed(2); 
    cart.totalPriceAfterDiscount =cart.totalPrice- couponDiscount;

    const updateCart = await cart.save();

    res.status(200).json({status:"success",numOfCartItems:cart.cartItem.length,data:updateCart});


})



