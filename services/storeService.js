const fs = require("fs");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const Store = require("../models/storeModel");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewares/handlersFactoryMiddleware");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const cloudinary = require("../utils/cloudinary");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

// Nested route (Create) for my  user or
exports.setUserIdToBody = asyncHandler((req, res, next) => {

  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  next();
});


exports.uploadStoreImage =  uploadMixOfImages("stores", [
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 1 },
]);


exports.uploadStoreImagesToCloudinary =
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
              const customFileName = `store-${uuidv4()}-${Date.now()}-imageCover`; // You can create your own naming scheme

              const result = await cloudinary.uploader.upload(
                singleImage[0].path,
                {
                  folder: "stores", // Optional: specify folder in Cloudinary
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
                  const customFileName = `store-${uuidv4()}-${Date.now()}`; // You can create your own naming scheme
                  const result = await cloudinary.uploader.upload(image.path, {
                    folder: "stores", // Optional: specify folder in Cloudinary
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
          const customFileName = `store-${uuidv4()}-${Date.now()}-imageCover`; // You can create your own naming scheme

          
          const result = await cloudinary.uploader.upload(
            req.files.imageCover[0].path,
            {
              folder: "stores", // Optional: specify folder in Cloudinary
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
              const customFileName = `store-${uuidv4()}-${Date.now()}`; // You can create your own naming scheme
              const result = await cloudinary.uploader.upload(image.path, {
                folder: "stores", // Optional: specify folder in Cloudinary
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



  exports.createFilterObj = async (req, res, next) => {    
      req.filterObj = { followingUser: req.user._id };
    
    next();
  };


// @desc    Get list of store
// @route   GET /api/v1/store
// @access  Public
exports.getStores = getAll(Store);

// @desc    Create store
// @route   POST  /api/v1/store
// @access  Private/seller-user
exports.createStore = createOne(Store);

// @desc    Update specific store
// @route   PUT /api/v1/store/:id
// @access  Private/seller
exports.updateStore = updateOne(Store);

// @desc    Delete specific store
// @route   DELETE /api/v1/store/:id
// @access  Private/Admin - seller
exports.deleteStore = deleteOne(Store);

// @desc    Get specific store by id
// @route   GET /api/v1/store/:id
// @access  Public
exports.getStore = getOne(Store);

// @desc    Get my followed store
// @route   GET /api/v1/store/followed-store
// @access  Private/user
exports.getLoggedUserFollowedStores =getAll(Store);

// @desc    Update Following User
// @route   PUT /api/v1/store/:id/following-user
// @access  Private/user
exports.updateFollowingUser = asyncHandler(async (req, res, next) =>   {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return next(new ApiError(`store not found with id ${req.params.id}`, 404));
  }

  const isFollowed = store.followingUser.includes(req.user._id)
  if(isFollowed){
    store.followingUser.pull(req.user._id)
  }else {
    store.followingUser.addToSet(req.user._id)
  }

await store.save()

  res.status(200).json({
    status: "success",
    data:store
  });

 });


// @desc    Update Store Status
// @route   PUT /api/v1/store/:id/update-status
// @access  Private/admin
exports.updateStoreStatus = asyncHandler(async (req, res, next) => {
  const {status} = req.body

  const store = await Store.findById(req.params.id)
  if(!store){
    return next(new ApiError(`store not found with id ${req.params.id}`, 404));
  } 

  store.status = status
 
  
  if(status === "active"){
    const user = await User.findById(store.user);
    if(!user){
      return next(new ApiError(`user not found with id ${store.user}`, 404));
    } 
    // if role is role convert to seller or you can direct same i as seller
    user.role = user.role==="user" ? "seller" : "seller"
    await user.save()

  }

  await store.save()
  res.status(200).json({
    status: "success",
    data: store,
  });
});
