const express = require("express");

const router = express.Router()


const { getLoggedUserCart, addProductToCart, clearCart, updateCartItemQuantity, removeSpecificCartItem ,applyCoupon} = require("../services/cartService")
const {addProductToCartValidator,updateCartItemQuantityValidator,removeSpecificCartItemValidator,applyCouponValidator} = require("../utils/validators/cartValidator");

const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")


router.route("/")
.get(protect,allowedTo("user"),getLoggedUserCart)
.post(protect,allowedTo("user"),addProductToCartValidator,addProductToCart)
.delete(protect,allowedTo("user"),clearCart)

router.route("/applyCoupon").get(protect,allowedTo("user"),applyCouponValidator,applyCoupon)

router.route("/:id")
.put(protect,allowedTo("user"),updateCartItemQuantityValidator,updateCartItemQuantity)
.delete(protect,allowedTo("user"),removeSpecificCartItemValidator,removeSpecificCartItem)



module.exports = router;