const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "user required"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "product required"],
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],

    shippingAddress: {
      alias: {
        type: String,
        required: [true, "address alias required"],
        minlength: [2, "too short address alias"],
        maxlength: [10, "too long address alias"],
      },
      details: {
        type: String,
        required: [true, "address details required"],
        minlength: [2, "too short address details"],
        maxlength: [256, "too long address details"],
      },
      phone: {
        type: String,
        required: [true, "phone number required"],
      },
      city: {
        type: String,
        required: [true, "city required"],
        minlength: [2, "too short city"],
        maxlength: [32, "too long city"],
      },
      postalCode: {
        type: String,
        required: [true, "postal code required"],
        minlength: [5, "too short postal code"],
        maxlength: [10, "too long postal code"],
      },
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    paymentMethodType: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    DeliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Order", orderSchema);



orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name profileImg email phone',
  }).populate({
    path: 'cartItems.product',
    select: 'title imageCover ',
  });

  next();
});

module.exports = orderModel;
