const express = require("express");

const router = express.Router();

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  uploadCategoryImage,
  uploadCategoryImageToCloudinary
} = require("../services/categoryService");

const {
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  getCategoryValidator,
} = require("../utils/validators/categoryValidator");
const {validateActualTypeAndCleanFileSingleImage} = require("../middlewares/uploadImageMiddleware")
const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

const subCategoryRouter = require("./subCategoryRoute");

//nested route
router.use("/:categoryId/subcategories", subCategoryRouter);

router
  .route("/")
  .get(getCategories)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadCategoryImage,
    createCategoryValidator,
    validateActualTypeAndCleanFileSingleImage,
    uploadCategoryImageToCloudinary,
    createCategory
  );
router
  .route("/:id")
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadCategoryImage,
    updateCategoryValidator,
    validateActualTypeAndCleanFileSingleImage,
    uploadCategoryImageToCloudinary,
    updateCategory
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  )
  .get(getCategoryValidator, getCategory);

module.exports = router;
