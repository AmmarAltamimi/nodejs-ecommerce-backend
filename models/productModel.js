const mongoose  = require('mongoose');


const productSchema = new mongoose.Schema({
    title : {
        type:String,
        required: [true,"product required"],
        minlength: [2,"too short product name"],
        maxlength: [32,"too long product name"],
    },
    slug:{
        type:String,
        lowercase:true,
    },
    description: {
        type:String,
        required:[true,"description required"],
        minlength: [10,"too short product description"],
        maxlength: [500,"too long product description"],

    },
    count:{
        type:Number,
        required:[true,"quantity required"],
    },
    price:{
        type:Number,
        required:[true,"price required"],
        max:[20000,"price must be less than 20000"],

    },
    priceAfterDiscount:{
        type:String,

    },
    sold:{
        type:Number,
        default:0,
    },
    colors:[{
        type:String,
    }],
    // imageCover:{
    //     type:String,
    //     required:[true,"image cover required"],
    // },
    // images:[{
    //     type:String,
    // }],
    ratingAverage:{
        type:Number,
        min: [1, 'Rating must be above or equal 1.0'],
        max: [5, 'Rating must be below or equal 5.0'],
    },
    ratingQuality:{
        type:Number,
        default:0,
    },
    category:{
        type:mongoose.Schema.ObjectId,
        ref:'category',
        required:[true,"category required"],
    },
    subCategories:[{
        type:mongoose.Schema.ObjectId,
        ref:'subCategory',
        required:[true,"subcategory required"],
    }],
    brand:{
        type:mongoose.Schema.ObjectId,
        ref:'brand',
        required:[true,"brand required"],
    }


},{
    timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})


productSchema.virtual('reviews',{
    ref:"Review",
    foreignField:"product",
    localField:"_id"
})


const productModel = mongoose.model('Product',productSchema);



module.exports= productModel;
