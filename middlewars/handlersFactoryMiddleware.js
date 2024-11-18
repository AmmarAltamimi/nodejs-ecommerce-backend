const asyncHandler =require("express-async-handler");
const ApiFeature = require("../utils/apiFeatures")
const ApiError = require("../utils/apiError");


exports.getAll =  (Model)=> asyncHandler(async(req,res)=>{
        let filter={}
        if(req.filterObj){
            filter = req.filterObj;
        }

        const documentsCounts = await Model.countDocuments();
        const Query =  Model.find(filter)
    
        const apiFeatures = new ApiFeature(Query,req.query).filter().sort().limitFields().search(Model.modelName).paginate(documentsCounts);
    
        const {mongooseQuery,pagination} = apiFeatures
    
        const documents = await  mongooseQuery
        
        res.status(200).json({states:"success", result:documents.length,data:documents,pagination:pagination});
    })



exports.createOne =(Model)=> asyncHandler(async(req,res)=>{
    
    const newDocument = await Model.create(req.body);
    res.status(201).json({states:"success",data:newDocument});
    
})

exports.updateOne = (Model)=> asyncHandler(async(req,res,next)=>{

    const updatedDocument = await Model.findByIdAndUpdate(req.params.id,req.body,{new:true});
    if(!updatedDocument) {
        return next(new ApiError(`there is no ${Model.modelName} with id ${req.params.id}`,404))
    }

        // Trigger "save" event when update document
        updatedDocument.save()

    res.status(200).json({states:"success",data:updatedDocument});

})


exports.deleteOne = (Model)=> asyncHandler(async(req,res,next)=>{

    const deletedDocument = await Model.findByIdAndDelete(req.params.id);
    if(!deletedDocument) {
                return next(new ApiError(`there is no ${Model.modelName}  with id ${req.params.id}`,404))
    }

        // Trigger "remove" event when update document
        deletedDocument.remove()

    res.status(204).send()

})


exports.getOne = (Model,populationOpt)=> asyncHandler(async(req,res,next)=> {       
    let query =  Model.findById(req.params.id);

    if(populationOpt){
        query = query.populate(populationOpt)
    }

   const document = await query

    if(!document) {
        return next(new ApiError(`there is no ${Model.modelName}  with id ${req.params.id}`,404))
    }

    res.status(200).json({states:"success",data:document});

})

