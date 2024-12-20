const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "review title required"],
      minlength: [2, "too short review title"],
      maxlength: [200, "too long review title"],
    },
    ratings: {
      type: Number,
      required: [true, "ratings required"],
      min: [1, "minimum rating is 1"],
      max: [5, "maximum rating is 5"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "user required"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "product required"],
    },
  },
  { timestamps: true }
);

// Static method to calculate average ratings and quantity
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (productId) {
  // make the operations for calcAverageRatingsAndQuantity
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: `product`,
        avgRatings: { $avg: `$ratings` },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);

  // save it to product Model

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: result[0].avgRatings,
      ratingQuality: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: 0,
      ratingQuality: 0,
    });
  }
};

// Post-save hook
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

// Post-remove hook
reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

// Pre-find hook to populate user data
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
