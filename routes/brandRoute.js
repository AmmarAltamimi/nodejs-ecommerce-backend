const express = require('express');

const router = express.Router();

const {getBrands,createBrand,updateBrand,deleteBrand,getBrand,uploadBrandImage,resizeImage} = require("../services/brandService ");

const {createBrandValidator,updateBrandValidator,deleteBrandValidator,getBrandValidator} = require("../utils/validators/brandValidator ");
const {protect} = require("../middlewars/protectMiddleware")
const {allowedTo} = require("../middlewars/allowedToMiddleware")




router.route("/").get(getBrands).post(protect,allowedTo("admin","manager"),createBrandValidator,uploadBrandImage,resizeImage,createBrand);
router.route("/:id").put(protect,allowedTo("admin","manager"),updateBrandValidator,uploadBrandImage,resizeImage,updateBrand)
.delete(protect,allowedTo("admin","manager"),deleteBrandValidator,deleteBrand).get(getBrandValidator,getBrand)





module.exports = router;



