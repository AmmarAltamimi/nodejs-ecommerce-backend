const path = require("path");

const express = require("express");

const app =express();
const cors = require("cors");
const compression = require("compression");

const morgan = require("morgan");


const dotenv = require("dotenv");

dotenv.config({path : 'config.env'});
const {dbConnection} = require("./config/database")

const {globalError} = require(`./middlewars/errorMiddleware`)



const categoryRouter = require("./routes/categoryRoute");
const subCategoryRouter = require("./routes/subCategoryRoute");
const brandRouter = require("./routes/brandRoute");
const productRouter = require("./routes/productRoute");
const couponRouter = require("./routes/couponRoute");
const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
const wishlistRouter = require("./routes/wishlistRoute")
const addressRouter = require("./routes/addressRoute")
const reviewRouter = require("./routes/reviewRoute")
const cartRouter = require("./routes/cartRouter")
const orderRouter = require("./routes/orderRoute")
const { webhookCheckout } = require('./services/orderService');


const ApiError = require(`./utils/apiError`);


// connect to database
dbConnection();


// Enable other domains to access your application
app.use(cors());
app.options('*', cors());

// compress all responses
app.use(compression());


// Checkout webhook
app.post(
    '/webhook-checkout',
    express.raw({ type: 'application/json' }),
    webhookCheckout
  );

app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    console.log(`mode: ${process.env.NODE_ENV}`);
  }
  

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

 


app.all("*",(req,res,next)=>{
    next(new ApiError (`Can't find this route: ${req.originalUrl}`,400))
})

app.use(globalError)



const port = process.env.PORT || 8000
const server = app.listen(port , ()=>{
    console.log(`app listening on port  ${port}` );

})


process.on("unhandledRejection",(err)=>{
    console.error(`Unhandled rejection Error : ${err.name} | ${err.message}`);
    server.close(()=>{
        console.log("shutting down ...");
        process.exit(1);
    })
})


