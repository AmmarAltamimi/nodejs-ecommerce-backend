const slugify = require("slugify");
const bcrypt = require("bcryptjs");

exports.setSlug = async (val, req, Model) => {
  const slug = slugify(val);
  let suffix = 1;
  let newSlug = slug

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const isExist = await Model.findOne({ slug: newSlug });
    if (!isExist) {
      break;
    }
    newSlug = `${slug}-${suffix}`
    suffix += 1;
  }
  req.body.slug = newSlug;
  return true;
};

exports.setSlugArray =async (val, req, Model,path) => {
  const slug = slugify(val);
  let suffix = 1;
  let newSlug = slug
  let isExists;
  const match = path.match(/\[(\d+)\]/); // Extracts the number inside the square brackets
  const index = match ? parseInt(match[1], 10) : null;
  const currentVariant = req.body.variant[index];

  const products = await Model.find();
    // eslint-disable-next-line no-constant-condition
    while (true) {
    
      // eslint-disable-next-line no-loop-func, no-plusplus
      for (let i = 0; i < products.length; i++) {

        // eslint-disable-next-line no-loop-func
        isExists = products[i].variant.find((item)=>item.variantSlug === newSlug)
        if(isExists){
          break;
        }
        
      
      }    
      if (!isExists) {
        break;
      }
       newSlug = `${slug}-${suffix}`
      suffix += 1;
    }

    currentVariant.variantSlug=newSlug
    
  return true;
};

exports.ensureUniqueModelValue = async (val, req, currentId, Model, query) => {
  const document = await Model.findOne(query);

  if (currentId) {
    // Update
    if (document && document._id.toString() !== currentId.toString()) {
      throw new Error(`${val} already exists`);
    }
  } else {
    // Create scenario.
    // eslint-disable-next-line no-lonely-if
    if (document) {
      throw new Error(`${val} already exists`);
    }
  }

  return true;
};

exports.ensureUniqueSubModelValueSingleObject =  async (
  val,
  req,
  Model,
  query,
  currentId,
  array,
  uniqueField
) => {
  const document = await Model.find(query);

  let existsDoc;
  document.forEach((doc)=>{
  existsDoc = doc[array].find((item)=>item[uniqueField] === val)
  
})


  if (currentId) {
    // Update
    if (existsDoc && existsDoc._id.toString() !== currentId.toString()) {
      throw new Error(`${val} already exists`);
    }
  } else {
    // Create scenario.
    // eslint-disable-next-line no-lonely-if
    if (existsDoc) {
      throw new Error(`${uniqueField} already exists`);
    }

  }
  return true;
};



exports.ensureUniqueSubModelValueMultiObject = async (
  val,
  req,
  Model,
  currentId,
  query,
  array,
  uniqueField
) => {
  const document = await Model.find(query);
  let isExists;
  let counter = 0
  let productId;
  
    req.body[array].forEach((item)=>{
    if(item[uniqueField] === val){
      counter += 1
    }
  })

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < document.length; i++) {
    isExists = document[i][array].find((item)=>item[uniqueField] === val)
    if(isExists){
      productId =  document[i]._id
      break;
    }
   
  }
  if (currentId) {

    // Update
    if (isExists && productId.toString() !== currentId.toString()) {
      throw new Error(`${val} already exists`);
    }
  } else {
    // Create scenario.
    // eslint-disable-next-line no-lonely-if
    if (isExists ) {
      throw new Error(`${uniqueField} already exists`);
    }
    if ( counter > 1 ) {
      throw new Error(` you entered ${counter} ${uniqueField} with same value `);
    }
  }
  return true;
};



exports.ensureDocumentExistsById = async (val, req, Model) => {
  const document = await Model.findById(val);
  if (!document) {
    throw new Error(`Invalid ${Model.modelName}  id `);
  }
  return true;
};

exports.ensureAllDocumentsExistByIds = async (documentReceived, req, Model) => {  
  const document = await Model.find({
    _id: { $exists: true, $in: documentReceived },
  });
  
  if (document.length !== documentReceived.length) {
    throw new Error(`Invalid ${Model.modelName}  Ids`);
  }
  return true;
};

exports.ensureSubDocumentExistsById = async (
  val,
  req,
  Model,
  query,
  subModel
) => {
  const document = await Model.findOne(query);

  if (!document) {
    throw new Error(`Invalid ${Model.modelName}  id`);
  }

  
  const isSubDocumentExist = document[subModel].some(
    (a) => a._id.toString() === val
  );
  if (!isSubDocumentExist) {
    throw new Error(` ${subModel} id ${val} does Not belongs to  ${Model.modelName} `);
  }

  return true;
};

exports.ensureDocumentBelongToParent = async (
  val,
  req,
  Model,
  parentKey,
  parentId
) => {
  const document = await Model.findById(val);
  if (!document) {
    throw new Error(`${Model.modelName}  not found`);
  }
  if (document[parentKey].toString() !== parentId) {
    throw new Error(
      `${Model.modelName} must be belong to parentId id  ${parentId}`
    );
  }
  return true;
};

exports.ensureDocumentBelongToAllParent = async (
  val,
  req,
  Model,
  parentKey,
  receivedParentIds
) => {
  const document = await Model.findById(val);
  if (!document) {
    throw new Error(`${Model.modelName}  not found`);
  }

  // get all parent id and convert to string id
  const allParentIds = document[parentKey].map((id) => id.toString());

  const isAllReceivedParentIdsExist = receivedParentIds.every((id) =>
    allParentIds.includes(id)
  );

  if (!isAllReceivedParentIdsExist) {
    throw new Error(
      `${Model.modelName} must be belong to all parentId id  ${receivedParentIds}`
    );
  }
  return true;
};

exports.ensureAllDocumentsBelongToParent = async (
  childDocumentReceivedId,
  req,
  Model,
  filterObj,
  parentId
) => {
  const allChildDocumentsBelongToThisParent = await Model.find(filterObj);
  const allChildDocumentsId = allChildDocumentsBelongToThisParent.map(
    (itemObj) => itemObj._id.toString()
  );

  const isAllBelongToDocumentsId = childDocumentReceivedId.every((item) =>
    allChildDocumentsId.includes(item)
  );

  if (!isAllBelongToDocumentsId) {
    throw new Error(
      `all ${Model.modelName} must be belong to parentId id ${parentId}`
    );
  }
  return true;
};

exports.isPriceLessThanOriginalPrice = (val, req,path) => {
  const match = path.match(/\[(\d+)\]/); // Extracts the number inside the square brackets
  const index = match ? parseInt(match[1], 10) : null;
  const currentVariant = req.body.variant[index];

  
  if (val < currentVariant.price) {
    throw new Error("price  must be less than originalPrice");
  }

  return true;
};

exports.isTimeMinLessThanTimeMax = (val, req) => {
  
  // i will make this validator for both store and shipping rate but i will save value which send so we have two option
  // if in store may be will send defaultDeliveryTimeMax and if not send when used default value which is 31
  // if in shipping rate it must send deliveryTimeMax
  const timeMax = req.body.deliveryTimeMax || req.body.defaultDeliveryTimeMax ||  31

  if (val > timeMax) {
    throw new Error("Minimum delivery time must be less than maximum");
  }

  return true;
};




exports.isSaleExists = (val, req,path) => {
  const match = path.match(/\[(\d+)\]/); // Extracts the number inside the square brackets
  const index = match ? parseInt(match[1], 10) : null;
  const currentVariant = req.body.variant[index];

  if (currentVariant.isSale === "true" || currentVariant.saleEndDate || currentVariant.discountType || currentVariant.discountValue ) {
    throw new Error("You cannot use a temporary offer and a permanent price together");
  }

 

  return true;
};

exports.checkPasswordConfirm = (password, req) => {
  if (password !== req.body.passwordConfirm) {
    throw new Error(" password Confirm incorrect");
  }
  return true;
};

exports.checkCurrentPassword = async (currentPassword, req, Model) => {
  if (req.user.role === "user") {
    req.params.id = req.user._id;
  }

  const user = await Model.findById(req.params.id);
  const IsCurrentPassword = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!IsCurrentPassword) {
    throw new Error("currentPassword is wrong");
  }
  return true;
};

exports.check6DigitsResetCode = (resetCode, req) => {
  if (resetCode.length !== 6) {
    throw new Error("resetCode must be 6 digits");
  }
  return true;
};

exports.MultipleCountryCodes = (val, validator) => {
  const locales = ["US", "CA", "GB"];
  const isValid = locales.some((locale) => validator.isPostalCode(val, locale));
  if (!isValid) {
    throw new Error("country code must be one of US, CA, GB");
  }
  return true;
};

exports.checkIfUserReviewedProduct = async (productId, req, Model) => {
  const review = await Model.findOne({
    product: productId,
    user: req.user._id,
  });
  if (review) {
    throw new Error("You have already reviewed this product");
  }
  return true;
};

exports.validateUserOwnership = async (Id, req, Model,refName) => {
  let document = await Model.findById(Id);

  // check owner Ship for user key
  const documentUserId = document.user?._id.toString() || document.user?.toString();
  if (documentUserId !== req.user._id.toString()) {
    throw new Error(`You do not have permission to perform this action on ${Model.modelName}.`);
  }
};

exports.validateReferenceOwnership  = async (Id, req, Model,refName) => {
  let document = Model.findById(Id).populate(refName);
  // check owner ship for ref that has schema include user key
    const documentUserSchema =  document[refName].user.toString()
  if (documentUserSchema !== req.user._id.toString()) {
    throw new Error(`You do not have permission to perform this action on ${Model.modelName}.`);
  

  }
};

exports.validateOwnership = async (Id, req, Model, idName) => {
  const document = await Model.findById({ _id: req.params.id });

  if (!document) {
    throw new Error(`${Model.modelName}  not found`);
  }
  if (document[idName].toString() !== Id) {
    throw new Error(`${Model.modelName} id does not belongs to parent id `);
  }
};

exports.checkSingleImage = (val, req) => {
  if (!req.file) {
    throw new Error("image is required");
  }
  return true;
};

exports.checkMaxImages = (val, req) => {
  if (!req.files) {
    throw new Error("images is required");
  }
  return true;
};

exports.checkStoreImages = (val, req) => {
  // i did Object.keys(req.files).length because !req.files not working
  if (
    Object.keys(req.files).length === 0 ||
    !req.files.imageCover ||
    !req.files.images
  ) {
    throw new Error("both imageCover and images are required");
  }

  return true;
};
exports.validateTypeDiscriminator = (val, req) => {
  const validSubCategories = ["women", "men", "phone", "laptop"];
  if (!validSubCategories.includes(val)) {
    throw new Error("Invalid  subcategory type.");
  }
  return true;
};

exports.checkIfIsSaleExit = (val, req, path) => {
  const match = path.match(/\[(\d+)\]/); // Extracts the number inside the square brackets
  const index = match ? parseInt(match[1], 10) : null;
  const currentVariant = req.body.variant[index];

  if (currentVariant.isSale === "true" && (!currentVariant.saleEndDate || !currentVariant.discountType || !currentVariant.discountValue) ) {
    throw new Error("As you choose sale discount you must enter saleEndDate , discountType and discountValue");
    
  }
  return true;
};

// exports.checkDiscountValue = (val, req, path) => {
//   const match = path.match(/\[(\d+)\]/); // Extracts the number inside the square brackets
//   const index = match ? parseInt(match[1], 10) : null;
//   const currentVariant = req.body.variant[index];

//   if (
//     currentVariant.discountType === "fixed" &&
//     currentVariant.discountValue > currentVariant.price
//   ) {
//     throw new Error("price after discount must be less than price");
//   }
//   if (
//     currentVariant.discountType === "percentage" &&
//     (currentVariant.discountValue > 100 || currentVariant.discountValue < 0)
//   ) {
//     throw new Error("percentage discount value must be between 0 and 100");
//   }

//   return true;
// };

// exports.checkDiscountValueForUpdate = (val, req) => {
//   if (
//     req.body.variant.discountType === "fixed" &&
//     req.body.variant.discountValue > req.body.variant.price
//   ) {
//     throw new Error("price after discount must be less than price");
//   }
//   if (
//     req.body.variant.discountType === "percentage" &&
//     (req.body.variant.discountValue > 100 || req.body.variant.discountValue < 0)
//   ) {
//     throw new Error("percentage discount value must be between 0 and 100");
//   }

//   return true;
// };

exports.validateOption = (val, req) => {
  const option = [
    "color",
    "size",
    "material",
    "phone storage capacity",
    "phone ram size",
    "phone network type",
    "phone operating system",
    "phone battery capacity",
    "phone screen size",
    "laptop processor brand",
    "laptop processor type",
    "laptop hardDisk capacity",
    "laptop storage type",
    "laptop operating system",
    "laptop screen size",
  ];

  if (!option.includes(val)) {
    throw new Error(
      "Invalid name. Choose from the following options: color, size, material, phone storage capacity, phone ram size, phone network type, phone operating system, phone battery capacity, phone screen size, laptop processor brand, laptop processor type, laptop hard disk capacity, laptop storage type, laptop operating system, laptop screen size"
    );
  }
  return true;
};

exports.ensureStartDateLessThanExpireDate = (val, req) => {
  const expireDate = new Date(req.body.expire).getTime();
  const startDate = new Date(val).getTime();

  if (expireDate <= startDate) {
    throw new Error("start Date must be less than expire Date");
  }

  return true;
};


exports.ensureNoFreeShippingForAll = (val, req) => {

  
  if (req.body.freeShippingForAllCountries ===  "true") {
    throw new Error("Cannot have both freeShippingForAllCountries and specific countries");
  }

  return true;
};




exports.ensureSingleDefaultVariant = (val, req) => {
let counter = 0;
  req.body.variant.forEach((item)=>{
    if(item.defaultVariant === "true"){
      counter += 1
    }
  })
  if(counter > 1){
    throw new Error("Cannot have more than one default variant");

  }
  return true;
};



exports.ensureUniqueUserAddressAlias =async (val, req,Model) => {
  const address = await Model.findOne({user:req.user._id , alias:val})
    if(address){
      throw new Error(`You already have an address with the alias "${val}". Please choose a different alias.`);
  
    }
    return true;
  };
  


  exports.ensureUniqueDefaultUser =async (val, req,Model) => {
    const address = await Model.findOne({user:req.user._id , defaultAddress:true})
      if(address){
        address.defaultAddress = false;
        await address.save();
      }
      return true;
    };
    