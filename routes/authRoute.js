/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");

const router = express.Router();

const {
  signUp,
  login,
  forgetPassword,
  verifyPassResetCode,
  resetPassword,
  uploadUserImage,
  uploadUserImageToCloudinary,
} = require("../services/authService");
const {
  signUpValidator,
  loginValidator,
  forgetPasswordValidator,
  verifyPassResetCodeValidator,
  resetPasswordValidator,
} = require("../utils/validators/authValidation");
const {
  userDefaultImage,
  validateActualTypeAndCleanFileSingleImage,
} = require("../middlewares/uploadImageMiddleware");

router.post(
  "/signUp",
  uploadUserImage,
  userDefaultImage,
  signUpValidator,
  validateActualTypeAndCleanFileSingleImage,
  uploadUserImageToCloudinary,
  signUp
);

router.post("/login", loginValidator, login);
router.post("/forgetPassword", forgetPasswordValidator, forgetPassword);
router.post(
  "/verifyPassResetCode",
  verifyPassResetCodeValidator,
  verifyPassResetCode
);
router.put("/resetPassword", resetPasswordValidator, resetPassword);

module.exports = router;
