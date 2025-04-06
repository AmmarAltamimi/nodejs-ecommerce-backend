const mongoose = require("mongoose");
const Product = require("./productModel")

const offerTagScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "offerTag  required"],
      unique: [true, " offerTag must  be unique"],
      minlength: [3, "too short offerTag name"],
      maxlength: [32, "too long offerTag name"],
      trim: true,

    },
    slug: {
      type: String,
      lowercase: true,
    },
    featured : {
      type:Boolean,
      default:false
    },

       
  },
  
  { timestamps: true }
);

offerTagScheme.pre("findOneAndDelete", async function (next) {
  const offerTag = await this.model.findOne(this.getQuery());

  if (offerTag) {

    await Product.updateMany(
      { offerTags: offerTag._id },
      { $pull: { offerTags: offerTag._id } }
    );
  }
  next();
});

const  OfferTagModel = mongoose.model("OfferTag", offerTagScheme);

module.exports = OfferTagModel;
