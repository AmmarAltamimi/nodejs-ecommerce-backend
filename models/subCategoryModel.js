const mongoose = require('mongoose');


const subCategorySchema = new mongoose.Schema({
   name:{
    type : String,
    required:[true,"subCategory required"],
    minlength:[2,"too short subCategory name"],
    maxlength:[32,"too long subCategory name"],
    unique:[true,"sub category must be unique"]
   },
   slug : {
    type : String,
    lowercase:true,
   },
   category:{
    type: mongoose.Schema.ObjectId,
    ref : "category",
   }

//    image: {
//     type:string,
//     required: [true, "category image required"],

//    }

},{timestamps:true})




const SubCategoryModel = mongoose.model("subCategory",subCategorySchema);



module.exports = SubCategoryModel;