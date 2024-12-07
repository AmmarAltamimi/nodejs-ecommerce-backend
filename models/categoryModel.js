const mongoose = require("mongoose");

const categoryScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category  required"],
      unique: [true, " category must  be unique"],
      minlength: [3, "too short category name"],
      maxlength: [32, "too long category name"],
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
  
  { timesTamps: true }
);

const CategoryModel = mongoose.model("category", categoryScheme);

module.exports = CategoryModel;
