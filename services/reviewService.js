const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../middlewares/handlersFactoryMiddleware");
const { uploadArrayImage } = require("../middlewares/uploadImageMiddleware");
const cloudinary = require("../utils/cloudinary");
const Review = require("../models/reviewModel");

exports.uploadReviewImage = uploadArrayImage("images");


exports.uploadReviewImagesToCloudinary =
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
              const customFileName = `review-${uuidv4()}-${Date.now()}-imageCover`; // You can create your own naming scheme

              const result = await cloudinary.uploader.upload(
                singleImage[0].path,
                {
                  folder: "reviews", // Optional: specify folder in Cloudinary
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
                  const customFileName = `review-${uuidv4()}-${Date.now()}`; // You can create your own naming scheme
                  const result = await cloudinary.uploader.upload(image.path, {
                    folder: "reviews", // Optional: specify folder in Cloudinary
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
          const customFileName = `review-${uuidv4()}-${Date.now()}-imageCover`; // You can create your own naming scheme

          const result = await cloudinary.uploader.upload(
            req.files.imageCover[0].path,
            {
              folder: "reviews", // Optional: specify folder in Cloudinary
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
              const customFileName = `review-${uuidv4()}-${Date.now()}`; // You can create your own naming scheme
              const result = await cloudinary.uploader.upload(image.path, {
                folder: "reviews", // Optional: specify folder in Cloudinary
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

// Nested route (get)
exports.createFilterObj = asyncHandler((req, res, next) => {
  if (req.params.productId) {
    req.filterObj = { product: req.params.productId };
  }

  next();
});

// Nested route (Create) for specific  product or
// Nested route (Create) for my  user or

exports.setProductIdAndUserIdToBody = asyncHandler((req, res, next) => {
  if (!req.body.product) {
    req.body.product = req.params.productId;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  next();
});


// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = getAll(Review);

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/Protect/User
exports.createReview = createOne(Review);

// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/Protect/User
exports.updateReview = updateOne(Review);

// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Protect/User-Admin
exports.deleteReview = deleteOne(Review);


// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = getOne(Review);


// @desc     Update Likes Review
// @route   GET /api/v1/reviews/:id/update-likes
// @access  Private/Protect/User
exports.updateLikesReview = asyncHandler(async (req, res,next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError(`review not found with id ${req.params.id}`, 404));
  }

  const isLiked = review.userLiked.includes(req.user._id)
  if(isLiked){
    review.userLiked.pull(req.user._id)
  }else {
    review.userLiked.addToSet(req.user._id)
  }

await review.save()

  res.status(200).json({
    status: "success",
    message: "updateLikesReview successfully ",
    data:review
  });

 });