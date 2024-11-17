class ApiFeature {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    }


   
  filter(){
    const queryStringObj= {...this.queryString}
    const excludesFields = ["limit","page","sort","keyword","fields"];
    excludesFields.forEach((field)=> delete queryStringObj[field] )
    
    
      // Apply filtration using [gte, gt, lte, lt]
      let queryStr = JSON.stringify(queryStringObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
       this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr)).clone()


       return this;
  } 



  sort(){
    if(this.queryString.sort){
        const sortBy = this.queryString .sort.split(",").join(" ");
        this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else{
        this.mongooseQuery = this.mongooseQuery.sort("-createAt");
    
    }

    return this;
  }



  limitFields(){

    if(this.queryString.fields){
        const fieldsBy = this.queryString.fields.split(",").join(" ");
        this.mongooseQuery = this.mongooseQuery.select(fieldsBy);
    }else{
        this.mongooseQuery = this.mongooseQuery.select("-__v");
    
    }    

    return this;
  }
  
  
  
  search(modelName){
    let query = {}
    if(this.queryString.keyword){

        if(modelName === "Product"){
             query = {$or:[{title:{$regex:this.queryString.keyword,$options:"i"}},{description:{$regex:this.queryString.keyword,$options:"i"}}]}

        }else{
             query = {$or:[{name:{$regex:this.queryString.keyword,$options:"i"}}]}

        }
    
        this.mongooseQuery = this.mongooseQuery.find(query);
    }
    
    return this;
  }
  
  
  
  paginate(countDocuments){

    const page = this.queryString.page * 1   || 1;
    const limit = this.queryString.limit * 1 || 50;
    const skip = (page - 1) * limit;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    // Pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPage = Math.ceil(countDocuments / limit);
    if(page < pagination.numberOfPage ){
        pagination.nextPage = page + 1;

    }
    if(page > 1){
        pagination.prevPage = page - 1;
    }

    this.pagination = pagination


    return this;
  }


}


module.exports = ApiFeature;
