const express = require("express");

const router = express.Router({mergeParams: true});


const {createFilterObj,getOrders,createCashOrder,updateOrderToPaid,updateOrderToDelivered,getOrder,checkoutSession} = require("../services/orderService")
const{createCashOrderValidator,updateOrderToPaidValidator,updateOrderToDeliveredValidator,getOrderValidator,checkoutSessionValidator} = require("../utils/validators/orderValidator  ")
const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")


router.get("/",protect,allowedTo("user","admin","manager"),createFilterObj,getOrders)

router.post("/:cartId",protect,allowedTo("user"),createCashOrderValidator,createCashOrder)

router.get('/checkout-session/:cartId',protect,allowedTo("user"), checkoutSessionValidator ,checkoutSession);

  
router.route("/:id").get(protect,allowedTo("admin","manager"),getOrderValidator,getOrder)

router.put("/:id/isPaid",protect,allowedTo("admin","manager"),updateOrderToPaidValidator,updateOrderToPaid)
router.put("/:id/isDelivered",protect,allowedTo("admin","manager"),updateOrderToDeliveredValidator,updateOrderToDelivered)




module.exports =router;