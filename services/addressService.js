const asyncHandler =require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");


// @desc    Get logged user addresses list
// @route   GET /api/v1/addresses
// @access  Protected/User
exports.getLoggedUserAddresses = asyncHandler(async(req,res,next)=>{
    const user = await User.findOne({_id:req.user._id});
    if(!user){
        return next(new ApiError(`User not found with id ${req.user._id}`,404))
    }

    const addresses = user.addresses;
    res.status(200).json({status : "success",result:addresses.length,data:addresses});



})



// @desc    Add address to user addresses list
// @route   POST /api/v1/addresses
// @access  Protected/User
exports.addToAddress = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user._id,{

        $addToSet:{addresses:req.body}

    },{new:true})


    if(!user){
        return next(new ApiError(`User not found with id ${req.user._id}`,404))
    }
        res.status(200).json({status:"success",result:user.addresses.length,data:user.addresses});

})



// @desc    Remove address from user addresses list
// @route   DELETE /api/v1/addresses/:addressId
// @access  Protected/User
exports.deleteAddress = asyncHandler(async(req,res,next)=>{

    const user = await User.findByIdAndUpdate(req.user._id,{

        $pull:{addresses:{_id:req.params.addressId}}

    },{new:true})


    if(!user){
        return next(new ApiError(`User not found with id ${req.user._id}`,404))
    }
        res.status(200).json({status:"success",message:"address is removed successfully"});

})
