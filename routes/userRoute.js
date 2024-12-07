/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUser,
  getLoggedUserData,
  createUser,
  updateUser,
  updateLoggedUserData,
  updateUserPassword,
  updateLoggedUserPassword,
  deleteUser,
  activateUser,
  deactivateLoggedUser,
  uploadUserImage,
  uploadUserImageToCloudinary,
} = require("../services/userService");

const {
  createUserValidator,
  updateUserValidator,
  updateUserPasswordValidator,
  deleteUserValidator,
  getUserValidator,
  updateLoggedUserDataValidator,
  updateLoggedUserPasswordValidator,
} = require("../utils/validators/userValidator  ");
const {
  userDefaultImage,
  validateActualTypeAndCleanFileSingleImage,
} = require("../middlewares/uploadImageMiddleware");

const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");
const orderRouter = require("./orderRoute");

router.use("/:userId/orders", orderRouter);

//user
router.get("/getMe", protect, allowedTo("user"), getLoggedUserData, getUser);
router.put(
  "/updateMe",
  protect,
  allowedTo("user"),
  uploadUserImage,
  updateLoggedUserDataValidator,
  validateActualTypeAndCleanFileSingleImage,
  uploadUserImageToCloudinary,
  updateLoggedUserData
);
router.put(
  "/changeMyPassword",
  protect,
  allowedTo("user"),
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);
router.put("/deactivateMe", protect, allowedTo("user"), deactivateLoggedUser);
router.delete(
  "/deleteMe",
  protect,
  allowedTo("user"),
  getLoggedUserData,
  deleteUser
);

//admin
router
  .route("/")
  .get(protect, allowedTo("admin", "manager"), getUsers)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadUserImage,
    userDefaultImage,
    createUserValidator,
    validateActualTypeAndCleanFileSingleImage,
    uploadUserImageToCloudinary,
    createUser
  );
router
  .route("/:id")
  .get(protect, allowedTo("admin", "manager"), getUserValidator, getUser)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadUserImage,
    updateUserValidator,
    validateActualTypeAndCleanFileSingleImage,
    uploadUserImageToCloudinary,
    updateUser
  )
  .delete(
    protect,
    allowedTo("admin", "manager"),
    deleteUserValidator,
    deleteUser
  );
router
  .route("/activate/:id")
  .put(protect, allowedTo("admin", "manager"), activateUser);

router
  .route("/changePassword/:id")
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateUserPasswordValidator,
    updateUserPassword
  );

module.exports = router;
