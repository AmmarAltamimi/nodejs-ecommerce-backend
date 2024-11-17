const express = require('express');

const router = express.Router();



const {signUp,login,forgetPassword,verifyPassResetCode,resetPassword} = require("../services/authService")
const {signUpValidator,loginValidator,forgetPasswordValidator,verifyPassResetCodeValidator,resetPasswordValidator} = require("../utils/validators/authValidation")


router.post("/signUp",signUpValidator,signUp)
router.post("/login",loginValidator,login)
router.post("/forgetPassword",forgetPasswordValidator,forgetPassword)
router.post("/verifyPassResetCode",verifyPassResetCodeValidator,verifyPassResetCode)
router.put("/resetPassword",resetPasswordValidator,resetPassword)



module.exports = router;