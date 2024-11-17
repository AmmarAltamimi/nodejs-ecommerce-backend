const express = require('express');

const router = express.Router();

const {getCategories,createCategory,updateCategory,deleteCategory,getCategory} = require("../services/categoryService");

const {createCategoryValidator,updateCategoryValidator,deleteCategoryValidator,getCategoryValidator} = require("../utils/validators/categoryValidator");
const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")


const subCategoryRouter = require("./subCategoryRoute")


//nested route
router.use('/:categoryId/subcategories',subCategoryRouter)



router.route("/").get(getCategories).post(protect,allowedTo("admin","manager"),createCategoryValidator,createCategory);
router.route("/:id").put(protect,allowedTo("admin","manager"),updateCategoryValidator,updateCategory)
.delete(protect,allowedTo("admin","manager"),deleteCategoryValidator,deleteCategory)
.get(getCategoryValidator,getCategory)






module.exports = router;



