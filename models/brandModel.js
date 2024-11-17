const mongoose = require('mongoose');


const brandSchema = new mongoose.Schema({
name : {
    type:String,
    required:[true,"brand required"],
    unique:[true,"brand must be unique"],
    minlength:[2,"too short brand name"],
    maxlength:[32,"too long brand name"],
},
slug : {
    type : String,
    lowercase : true,
},


//    image: {
//     type:String,
//     required: [true, "category image required"],

//    }


},{timestamps:true});




const BrandModel = mongoose.model("brand",brandSchema);



module.exports= BrandModel;