const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "coupon name required"],
      minlength: [2, "too short coupon name"],
      maxlength: [50, "too long coupon name"],
      unique: [true, "coupon name unique"],
      trim: true,

    },
    expire: {
      type: Date,
      required: [true, "coupon expiration date required"],
    },
    discount: {
      type: Number,
      required: [true, "coupon discount percentage required"],
      min: [0, "discount percentage must be greater than 0"],
      max: [100, "discount percentage must be less than or equal to 100"],
    },
  },
  { timestamps: true }
);

const couponModel = mongoose.model("Coupon", couponSchema);

module.exports = couponModel;
