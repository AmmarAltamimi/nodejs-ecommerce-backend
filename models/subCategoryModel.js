const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "subCategory required"],
      minlength: [2, "too short subCategory name"],
      maxlength: [32, "too long subCategory name"],
      unique: [true, "sub category must be unique"],
      trim: true,

    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
    },

    image:  {
      url: {type:String,required:true},       // The image URL you will use in your app
      public_id:{type:String,required:true},  // The public ID for future reference
    }
  },
  { timestamps: true }
);

const SubCategoryModel = mongoose.model("subCategory", subCategorySchema);

module.exports = SubCategoryModel;
