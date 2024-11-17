const express = require('express');

const router = express.Router();





const {getAddresses,addToAddress,deleteAddress} = require("../services/addressService")
const {createAddressValidator,deleteAddressValidator} = require("../utils/validators/addressValidator")
const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")





router.route("/").get(protect,allowedTo("user"),getAddresses).post(protect,allowedTo("user"),createAddressValidator,addToAddress);
router.route("/:addressId").delete(protect,allowedTo("user"),deleteAddressValidator,deleteAddress)




module.exports = router



