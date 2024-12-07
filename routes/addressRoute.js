const express = require("express");

const router = express.Router();

const {
  getLoggedUserAddresses,
  addToAddress,
  deleteAddress,
} = require("../services/addressService");
const {
  addToAddressValidator,
  deleteAddressValidator,
} = require("../utils/validators/addressValidator");
const { protect } = require("../middlewares/protectMiddleware");
const { allowedTo } = require("../middlewares/allowedToMiddleware");

router
  .route("/")
  .get(protect, allowedTo("user"), getLoggedUserAddresses)
  .post(protect, allowedTo("user"), addToAddressValidator, addToAddress);
router
  .route("/:addressId")
  .delete(protect, allowedTo("user"), deleteAddressValidator, deleteAddress);

module.exports = router;
