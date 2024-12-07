const asyncHandler =require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");





// @desc    Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Protected/User
exports.getWishlists = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({_id:req.user._id}).populate('wishlist');
    if(!user){
        return next(new ApiError(`User not found with id ${req.user._id}`,404))
    }

    const wishlists = user.wishlist;
    res.status(200).json({status : "success",result:wishlists.length,data:wishlists});



})


// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Protected/User
exports.addToWishlist = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user._id,{

        $addToSet:{wishlist:req.params.productId}

    },{new:true})


    if(!user){
        return next(new ApiError(`User not found with id ${req.user._id}`,404))
    }
        res.status(200).json({status:"success",result:user.wishlist.length,data:user.wishlist});

})



// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Protected/User
exports.deleteWishlist = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user._id,{

        $pull:{wishlist:req.params.productId}

    },{new:true})


    if(!user){
        return next(new ApiError(`User not found with id ${req.user._id}`,404))
    }
        res.status(200).json({status:"success",message:"product  is removed successfully from wishlist"});

})
