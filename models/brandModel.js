const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "brand required"],
      unique: [true, "brand must be unique"],
      minlength: [2, "too short brand name"],
      maxlength: [32, "too long brand name"],
      trim: true,

    },
    slug: {
      type: String,
      lowercase: true,
    },

    image:  {
      url: {type:String,required:true},       // The image URL you will use in your app
      public_id:{type:String,required:true},  // The public ID for future reference
    }
    
  },
  { timestamps: true }
);

const BrandModel = mongoose.model("brand", brandSchema);

module.exports = BrandModel;
