const asyncHandler =require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");






exports.getAddresses = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({_id:req.user._id}).populate("addresses");
    if(!user){
        return next(new ApiError("User not found",404))
    }

    const addresses = user.addresses;
    res.status(200).json({status : "success",result:addresses.length,data:addresses});



})


exports.addToAddress = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user._id,{

        $addToSet:{addresses:req.body}

    },{new:true})


    if(!user){
        return next(new ApiError("User not found",404))
    }
        res.status(200).json({status:"success",result:user.addresses.length,data:user.addresses});

})




exports.deleteAddress = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user._id,{

        $pull:{addresses:{_id:req.params.addressId}}

    },{new:true})


    if(!user){
        return next(new ApiError("User not found",404))
    }
        res.status(200).json({status:"success",message:"address is removed successfully"});

})
