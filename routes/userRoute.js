const express = require('express');

const router = express.Router();



const {getUsers,getUser,getLoggedUserData,createUser,updateUser,updateLoggedUserData,updateUserPassword,updateLoggedUserPassword,deleteUser,activateLoggedUser,deactivateLoggedUser} = require("../services/userService")

const {createUserValidator,updateUserValidator,updateUserPasswordValidator,deleteUserValidator,getUserValidator,updateLoggedUserDataValidator,updateLoggedUserPasswordValidator} = require("../utils/validators/userValidator  ")
const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")
const orderRouter = require("./orderRoute")

router.use('/:userId/orders',orderRouter)


//user
router.get("/getMe",protect,allowedTo("user"),getLoggedUserData,getUser)
router.put("/updateMe",protect,allowedTo("user"),updateLoggedUserDataValidator,updateLoggedUserData)
router.put("/changeMyPassword",protect,allowedTo("user"),updateLoggedUserPasswordValidator,updateLoggedUserPassword)
router.put("/activate",protect,allowedTo("user"),activateLoggedUser)
router.put("/deactivate",protect,allowedTo("user"),deactivateLoggedUser)
router.delete("/deleteMe",protect,allowedTo("user"),getLoggedUserData,deleteUser)


//admin
router.route("/")
.get(protect,allowedTo("admin","manager"),getUsers)
.post(protect,allowedTo("admin","manager"),createUserValidator,createUser)
router.route("/:id")
.get(protect,allowedTo("admin","manager"),getUserValidator,getUser)
.put(protect,allowedTo("admin","manager"),updateUserValidator,updateUser)
.delete(protect,allowedTo("admin","manager"),deleteUserValidator,deleteUser)
router.route("/changePassword/:id").put(protect,allowedTo("admin","manager"),updateUserPasswordValidator,updateUserPassword)





module.exports = router;