const express = require('express');

const router = express.Router({mergeParams:true});


const {getProducts,createProduct,updatedProduct,deleteProduct,getProduct} = require("../services/productService")
const {createProductValidator,updatedProductValidator,deleteProductValidator,getProductValidator} = require("../utils/validators/productValidator  ")
const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")

const reviewRouter = require("./reviewRoute");

router.use("/:productId/reviews",reviewRouter)

router.route("/").get(getProducts).post(protect,allowedTo("admin","manager"),createProductValidator,createProduct);
router.route("/:id").put(protect,allowedTo("admin","manager"),updatedProductValidator,updatedProduct).delete(protect,allowedTo("admin","manager"),deleteProductValidator,deleteProduct)
.get(getProductValidator,getProduct)



module.exports = router;