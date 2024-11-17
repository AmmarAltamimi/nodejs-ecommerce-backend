const express = require("express");

const router = express.Router({mergeParams:true});
const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")




const {getReviews,createReview,updateReview,deleteReview,getReview,createFilterObj,setProductIdToBody,setUserIdToBody} = require("../services/reviewService")
const {createReviewValidator,updateReviewValidator,deleteReviewValidator,getReviewValidator} = require("../utils/validators/reviewValidator   ")


router.route("/")
.get(protect,allowedTo("admin","manager"),createFilterObj,getReviews)
.post(protect,allowedTo("user"),setProductIdToBody,setUserIdToBody,createReviewValidator,createReview);
router.route("/:id")
.put(protect,allowedTo("user"),updateReviewValidator,updateReview)
.delete(protect,allowedTo("admin","manager","user"),deleteReviewValidator,deleteReview)
.get(getReviewValidator,getReview);




module.exports =router