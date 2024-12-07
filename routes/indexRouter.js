const categoryRouter = require("./categoryRoute");
const subCategoryRouter = require("./subCategoryRoute");
const brandRouter = require("./brandRoute");
const productRouter = require("./productRoute");
const couponRouter = require("./couponRoute");
const authRouter = require("./authRoute");
const userRouter = require("./userRoute");
const wishlistRouter = require("./wishlistRoute")
const addressRouter = require("./addressRoute")
const reviewRouter = require("./reviewRoute")
const cartRouter = require("./cartRouter")
const orderRouter = require("./orderRoute")






 exports.mountRoutes = (app)=>{
app.use("/api/v1/categories",categoryRouter);
app.use("/api/v1/subcategories",subCategoryRouter);
app.use("/api/v1/brands",brandRouter);
app.use("/api/v1/products",productRouter);
app.use("/api/v1/coupons",couponRouter);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/wishlists",wishlistRouter);
app.use("/api/v1/addresses",addressRouter);
app.use("/api/v1/reviews",reviewRouter);
app.use("/api/v1/carts",cartRouter);
app.use("/api/v1/orders",orderRouter);


}