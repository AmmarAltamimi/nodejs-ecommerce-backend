const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const ApiFeature = require("../utils/apiFeatures");

const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewares/handlersFactoryMiddleware");
const {
  uploadMixOfImages,
} = require("../middlewares/uploadImageMiddleware");
const cloudinary = require("../utils/cloudinary");
const ApiError = require("../utils/apiError");
const {calculateShippingFeeAndAdditionalFeeAndOtherShippingDetails} = require("./cartService")

exports.uploadProductImagePart1 = uploadMixOfImages("products", [
  { name: "variant[0][imageCover]", maxCount: 1 },
  { name: "variant[0][images]", maxCount: 5 },
]);

exports.uploadProductImagePart2 = async (req, res, next) => {
  const fields = [];
  // if we have array of object and each object have  imageCover and images
  const lengthOfVariant = req.body.variant.length - 1; // except variant[0]

  if (lengthOfVariant > 0) {
    Array(lengthOfVariant)
      .fill(0)
      .forEach((_, index) => {
        fields.push(
          { name: `variant[${index + 1}][imageCover]`, maxCount: 1 },
          { name: `variant[${index + 1}][images]`, maxCount: 5 }
        );
      });
    const uploadDynamicFields = uploadMixOfImages("products", fields);
    uploadDynamicFields(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  }

  next();
};

exports.uploadProductImagesToCloudinary =
  (Name = false) =>
  async (req, res, next) => {
    // if updated  key not image so no req.file will be founded
    if (!req.files) {
      return next();
    }

    if (Name && req.body[Name] && req.body[Name].length > 0) {
      await Promise.all(
        req.body[Name].map(async (item, i) => {
          const singleImage = req.files[`${Name}[${i}][imageCover]`];
          const mixImage = req.files[`${Name}[${i}][images]`];

          if (singleImage) {
            try {
              const customFileName = `product-${uuidv4()}-${Date.now()}-imageCover`; // You can create your own naming scheme

              const result = await cloudinary.uploader.upload(
                singleImage[0].path,
                {
                  folder: "products", // Optional: specify folder in Cloudinary
                  public_id: customFileName, // Set the custom name for the image
                  quality: "auto", // Optional: set quality
                  width: 600, // Optional: resize image width
                  height: 600, // Optional: resize image height
                  crop: "fill", // Optional: crop the image
                }
              );

              req.body[Name][i].imageCover = {
                url: result.secure_url,
                public_id: result.public_id,
              };
            } catch (err) {
              fs.unlinkSync(singleImage[0].path); // Remove local file after successful upload
              throw new ApiError(
                `Failed to upload  to cloudinary ${err.message}`,
                500
              );
            }
          }

          if (mixImage) {
            req.body[Name][i].images = [];
            await Promise.all(
              mixImage.map(async (image) => {
                try {
                  const customFileName = `product-${uuidv4()}-${Date.now()}`; // You can create your own naming scheme
                  const result = await cloudinary.uploader.upload(image.path, {
                    folder: "products", // Optional: specify folder in Cloudinary
                    public_id: customFileName, // Set the custom name for the image
                    quality: "auto", // Optional: set quality
                    width: 600, // Optional: resize image width
                    height: 600, // Optional: resize image height
                    crop: "fill", // Optional: crop the image
                  });

                  req.body[Name][i].images.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                  });
                } catch (err) {
                  fs.unlinkSync(image.path); // Remove local file after successful upload
                  throw new ApiError(
                    `Failed to upload  to cloudinary ${err.message}`,
                    500
                  );
                }
              })
            );
          }
        })
      );
    } else {
      if (req.files.imageCover) {
        try {
          const customFileName = `product-${uuidv4()}-${Date.now()}-imageCover`; // You can create your own naming scheme

          const result = await cloudinary.uploader.upload(
            req.files.imageCover[0].path,
            {
              folder: "products", // Optional: specify folder in Cloudinary
              public_id: customFileName, // Set the custom name for the image
              quality: "auto", // Optional: set quality
              width: 600, // Optional: resize image width
              height: 600, // Optional: resize image height
              crop: "fill", // Optional: crop the image
            }
          );

          req.body.imageCover = {
            url: result.secure_url,
            public_id: result.public_id,
          };
        } catch (err) {
          fs.unlinkSync(req.files.imageCover[0].path); // Remove local file after successful upload
          throw new ApiError(
            `Failed to upload  to cloudinary ${err.message}`,
            500
          );
        }
      }

      if (req.files.images) {
        req.body.images = [];
        await Promise.all(
          req.files.images.map(async (image) => {
            try {
              const customFileName = `product-${uuidv4()}-${Date.now()}`; // You can create your own naming scheme
              const result = await cloudinary.uploader.upload(image.path, {
                folder: "products", // Optional: specify folder in Cloudinary
                public_id: customFileName, // Set the custom name for the image
                quality: "auto", // Optional: set quality
                width: 600, // Optional: resize image width
                height: 600, // Optional: resize image height
                crop: "fill", // Optional: crop the image
              });

              req.body.images.push({
                url: result.secure_url,
                public_id: result.public_id,
              });
            } catch (err) {
              fs.unlinkSync(image.path); // Remove local file after successful upload
              throw new ApiError(
                `Failed to upload  to cloudinary ${err.message}`,
                500
              );
            }
          })
        );
      }
    }

    next();
  };

// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = getAll(Product);


// @desc    Get list of products with its default variant
// @route   GET /api/v1/products/default
// @access  Public
exports.getProductsWithItsDefaultVariant =   asyncHandler(async (req, res) => {
  let filter = {};
  if (req.filterObj) {
    filter = req.filterObj;
  }

  const documentsCounts = await Product.countDocuments();
  const Query = Product.find(filter);

  const apiFeatures = new ApiFeature(Query, req.query)
    .filter()
    .sort()
    .limitFields()
    .search(Product.modelName)
    .paginate(documentsCounts);

  const { mongooseQuery, pagination } = apiFeatures;

  const documents = await mongooseQuery;

  //------------------------------------------
  // second part

  // new code i will add here because the above code is the general code for get all 
  // i will get online the default variant to display it i mean after get all products or products that have specific filter they have multi variant here i will get the default variant to display it  
 const newDocuments = documents.filter((product)=>{
    // for each product get the default variant we have two option maybe one variant or nothing can not be two because i make validator for one default variant
    let defaultVariant = product.variant.find((variant)=>variant.defaultVariant === true && variant.stockQuantity > 0)
    if(!defaultVariant){
      // if now variant with default true then get that have stockQuantity > 0 but maybe be more than one so find will get the first one
      defaultVariant =  product.variant.find((variant)=>variant.stockQuantity > 0)
    }

    if(defaultVariant) {
      // we have variant obj we will put in [] because the variant is array of obj
      product.variant = [defaultVariant]
      //return true only for filter on  documents.filter to return this product
      return true
    } 
       // delete products that all variant is outOfStock i will do return false to delete it
        return false
    
  })

  await Promise.all(newDocuments.map((product) => product.save()));
  res
    .status(200)
    .json({
      states: "success",
      result: newDocuments.length,
      data: newDocuments,
      pagination: pagination,
    });
});


// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private/seller
exports.createProduct = createOne(Product);

// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private/seller
exports.updatedProduct =asyncHandler(async (req, res, next) => {
    
  const updatedDocument = await Product.findByIdAndUpdate(
    req.params.id,
     req.body,
    { new: true }
  );


  if (!updatedDocument) {
    return next(
      new ApiError(
        `there is no ${Product.modelName} with id ${req.params.id}`,
        404
      )
    );
  }

// update the variant by dot because big array of obj can not update by findAndUpdate
  updatedDocument.variant =req.body.variant


  // Trigger "save" event when update document
  await updatedDocument.save();

  res.status(200).json({ states: "success", data: updatedDocument });
});

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private/seller
exports.deleteProduct = deleteOne(Product);



// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const {id,variantId} = req.params
  const product = await Product.findById(id).populate("reviews");

  if (!product) {
    return next(
      new ApiError(`there is no product  with id ${id}`, 404)
    );
  }

  const allVariant = product.variant
  // get product with selected variant
  const variant = product.variant.find((item)=>item._id.toString() === variantId)
  product.variant = [variant]


  

  // i need selectedOptions options to display them  except reset options
  const selectedOptions = { ...variant.toObject() };
  const excepts = [
    "defaultVariant",
    "variantTitle",
    "variantSlug",
    "variantDescription",
    "variantSpecifications",
    "keywords",
    "sku",
    "price",
    "originalPrice",
    "discountPercentage",
    "isSale",
    "saleEndDate",
    "discountType",
    "discountValue",
    "salePrice",
    "weight",
    "stockQuantity",
    "imageCover",
    "images",
    "_id",
  ];
  excepts.forEach((except) => delete selectedOptions[except]); // now selectedOptions is object of selected options and its value


  // make object have  array of each option with its  options without repeat
  const allOptions = {};
  Object.keys(selectedOptions).forEach((option) => {
    allOptions[option] = [
      ...new Set(allVariant.map((variantObj) => variantObj[option])),
    ];
  });


  // get the Product ShippingFee for this product with variant
  const {store,shippingFeeMethod} = product
  // make obj such as cartItemObj to send to calculateShippingFeeAndAdditionalFeeAndOtherShippingDetails and get the getProductShippingFee
  const ProductShippingFeeObj ={
      product: id,
      variant: variantId,
      store: store,
      snapshot:{
        shippingFeeMethod:shippingFeeMethod
      }
  }
 const ProductShippingFee = await calculateShippingFeeAndAdditionalFeeAndOtherShippingDetails(ProductShippingFeeObj)

  await product.save()
  res.status(200).json({
    states: "success",
    data: product,
    ShippingFee: ProductShippingFee,
    selectedOptions,
    allOptions,
  });
});






// exports.updateProductVariant = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { variantId, variant } = req.body;

//   const product = await Product.findById(id);

//   if (!product) {
//     return next(
//       new ApiError(`No product with ID ${id} or variant ${variantId}`, 404)
//     );
//   }

//   const updatedObjIndex = product.variant.findIndex(
//     (item) => item._id.toString() === variantId
//   );

//   if (updatedObjIndex === -1) {
//     return next(
//       new ApiError(`No variant with ID ${variantId} found in product`, 404)
//     );
//   }

//   product.variant[updatedObjIndex] = variant;
//   await product.save();

//   res.status(200).json({ status: "success", data: product });
// });
