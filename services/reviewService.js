const asyncHandler =require("express-async-handler");
const ApiError = require("../utils/apiError");


const {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
  } = require("../middlewars/handlersFactoryMiddleware");
  
  const Review = require("../models/reviewModel");


exports.createFilterObj = asyncHandler((req,res,next)=>{
    if(req.params.productId){
        req.filterObj = {product:req.params.productId}
    }

    next()

})


exports.setProductIdToBody = asyncHandler((req,res,next)=>{
    if(!req.body.product){
        req.body.product = req.params.productId
    }
    next()

})

exports.setUserIdToBody = asyncHandler((req,res,next)=>{
    if(!req.body.user){
        req.body.user = req.user._id
    }
    next()

})




exports.getReviews = getAll(Review);


exports.createReview = createOne(Review);


exports.updateReview = updateOne(Review);

exports.deleteReview = deleteOne(Review);

exports.getReview = getOne(Review);