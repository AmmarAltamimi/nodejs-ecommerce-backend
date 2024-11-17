const asyncHandler =require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");






exports.getWishlists = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({_id:req.user._id}).populate('wishlist');
    if(!user){
        return next(new ApiError("User not found",404))
    }

    const wishlists = user.wishlist;
    res.status(200).json({status : "success",result:wishlists.length,data:wishlists});



})


exports.addToWishlist = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user._id,{

        $addToSet:{wishlist:req.params.productId}

    },{new:true})


    if(!user){
        return next(new ApiError("User not found",404))
    }
        res.status(200).json({status:"success",result:user.wishlist.length,data:user.wishlist});

})




exports.deleteWishlist = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user._id,{

        $pull:{wishlist:req.params.productId}

    },{new:true})


    if(!user){
        return next(new ApiError("User not found",404))
    }
        res.status(200).json({status:"success",message:"product  is removed successfully from wishlist"});

})
