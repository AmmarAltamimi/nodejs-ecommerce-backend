const express = require("express");

const router = express.Router();

const {
  getStores,
  createStore,
  updateStore,
  deleteStore,
  getStore,
  uploadStoreImage,
  uploadStoreImagesToCloudinary,
  setUserIdToBody,
  createFilterObj,
  getLoggedUserFollowedStores,
  updateFollowingUser,
  updateStoreStatus
} = require("../services/storeService");

const {
  createStoreValidator,
  updateStoreValidator,
  deleteStoreValidator,
  getStoreValidator,
  updateStoreStatusValidator,
  updateFollowingUserValidator
} = require("../utils/validators/storeValidator");
const {
  validateActualTypeAndCleanFileMixOfImages,
} = require("../middlewares/uploadImageMiddleware");
const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

// route get store belongs to specific user : i will get them by query not by nested router (both ways correct)

router
  .route("/")
  .get(getStores)
  .post(
    protect,
    allowedTo("seller", "user"),
    uploadStoreImage,
    setUserIdToBody,
    createStoreValidator,
    validateActualTypeAndCleanFileMixOfImages(false),
    uploadStoreImagesToCloudinary(false),
    createStore
  );
  
router.get(
  "/followed-store",
  protect,
  allowedTo("user"),
  createFilterObj,
  getLoggedUserFollowedStores
);


router
  .route("/:id")
  .put(
    protect,
    allowedTo("seller"),
    uploadStoreImage,
    updateStoreValidator,
    validateActualTypeAndCleanFileMixOfImages(false),
    uploadStoreImagesToCloudinary(false),
    updateStore
  )
  .delete(
    protect,
    allowedTo("admin", "seller"),
    deleteStoreValidator,
    deleteStore
  )
  .get(getStoreValidator, getStore);


  router.put("/:id/following-user",
    protect,
    allowedTo("user"),
    updateFollowingUserValidator,
    updateFollowingUser)
    
  router.put("/:id/update-status",
    protect,
    allowedTo("admin"),
    updateStoreStatusValidator,
    updateStoreStatus)
module.exports = router;
