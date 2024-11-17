const  slugify  = require('slugify');
const bcrypt = require("bcryptjs")


exports.setSlug = (val,req) => {
        req.body.slug = slugify(val)
        return true;   
}


exports.valueAlreadyExists = async (val,req,Model)=>{
        const document = await Model.findOne({name:val});
        if(document){
            throw new Error(`${Model.modelName} name already exists`);
        }
        return true;
        }

 exports.valueAlreadyExistsInSubModel = async(val,req,Model)=>{
                const user = await Model.findOne({_id:req.user._id});
                if(!user){
                    throw new Error("User not found");
                }
                const address = user.addresses.find(a=>a.alias===val);
                if(address){
                    throw new Error("Alias already exists");
                }
        
                return true
            }

exports.isRefBelongsToModel = async(val,req,Model)=>{
        const document = await Model.findById(val);
        if(!document){
            throw new Error(`Invalid ${Model.modelName}  id`);
        }
        return true
    }

 exports.isRefBelongsToSubModel = async(val,req,Model)=>{
        const document = await Model.findById(req.user._id);
        if(!document){
            throw new Error(`Invalid ${Model.modelName}  id`);
        }

        const address = document.addresses.some(a=>a._id.toString()===val);
        if(!address){
                throw new Error("Invalid address id");
        }

        return true
    }


exports.isArrayOfRefBelongsToModel = async(documentReceived,req,Model)=> {
        const document = await Model.find({_id:{$exists:true , $in:documentReceived}});
        if(document.length !== documentReceived.length ){
            throw new Error(`Invalid ${Model.modelName}  Ids`);
        }
        return true
    }


exports.isSpecificModelBelongsToModel = async(documentReceived,req,Model,filterObj)=>{
        const documentsForSpecificDocument= await Model.find(filterObj);
        const documentsId = documentsForSpecificDocument.map((itemObj)=>itemObj._id.toString())
    
        const isAllBelongToDocumentsId = documentReceived.every(item => documentsId.includes(item));
        if(!isAllBelongToDocumentsId){
            throw new Error(`all subcategories must be belong to category with id ${req.body.category}`);
        }
        return true;
    }


exports.isPriceAfterDiscountLess = (val,req)=>{
        if(val > req.body.price){
            throw new Error("price after discount must be less than price");
        }

        return true
    }



exports.checkPasswordConfirm = (password,req) => {
        if(password !== req.body.passwordConfirm){
            throw new Error(" password Confirm incorrect")
        }
        return true
    }


    exports.checkCurrentPassword = async(currentPassword,req,Model) =>  {
        if(req.user.role ==="user"){
                req.params.id = req.user._id
        }
        
        const user = await Model.findById(req.params.id);
        const IsCurrentPassword =  await bcrypt.compare(currentPassword,user.password)

        if(!IsCurrentPassword){
            throw new Error("currentPassword is wrong")
        }
        return true;
}
    


exports.check6DigitsResetCode = (resetCode,req) => {
        if(resetCode.length !== 6 ) {
                throw new Error("resetCode must be 6 digits");
        }
        return true;
}




exports.MultipleCountryCodes = (val,validator)=>{

const locales = ['US', 'CA', 'GB'];
const isValid = locales.some((locale)=>  validator.isPostalCode(val,locale))
if(!isValid){
        throw new Error("country code must be one of US, CA, GB");
}
return true
 
}


exports.checkIfUserReviewedProduct = async(productId,req,Model)=> {
        const review = await Model.findOne({product:productId,user:req.user._id});
        if(review){
            throw new Error("You have already reviewed this product")
        }
        return true
    
     }


exports.validateUserReviewOwnership = async(Id,req,Model)=> {
    console.log(Id)
        const document = await Model.findById(Id);
        console.log(document)

        if(!document){
            throw new Error(`${Model.modelName}  not found`);
        }
        if(document.user._id.toString() !== req.user._id.toString()){
            throw new Error(`Your are not allowed to perform this action `);
        }
    }
    