const mongoose = require('mongoose');

const categoryScheme = new mongoose.Schema({
    name : {
        type:String,
        required: [true, "category  required"],
        unique:[true, " category must  be unique"],
        minlength:[3,"too short category name"],
        maxlength:[32,"too long category name"],
    },
    slug:{
        type : String,
        lowercase : true,
    },

//    image: {
//     type:string,
//     required: [true, "category image required"],

//    }


},{timesTamps : true});


const CategoryModel =  mongoose.model("category",categoryScheme);


module.exports = CategoryModel;