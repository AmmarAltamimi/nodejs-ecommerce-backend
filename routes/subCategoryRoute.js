const express = require('express');

const router = express.Router({mergeParams:true});

const{createFilterObj,setCategoryIdToBody,getSubCategories,getSubCategory,createSubCategory,updateSubCategory,deleteSubCategory} = require("../services/subCategorySerivce")
const {createSubCategoryValidator,updateSubCategoryValidator,deleteSubCategoryValidator,getSubCategoryValidator}= require("../utils/validators/subCategoryValidator")
const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")




router.route('/').get(createFilterObj,getSubCategories).post(protect,allowedTo("admin","manager"),setCategoryIdToBody,createSubCategoryValidator,createSubCategory);
router.route('/:id').put(protect,allowedTo("admin","manager"),updateSubCategoryValidator,updateSubCategory)
.delete(protect,allowedTo("admin","manager"),deleteSubCategoryValidator,deleteSubCategory)
.get(getSubCategoryValidator,getSubCategory);




module.exports = router;




