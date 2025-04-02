const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "user required"],
    },
    shippingAddress:  {
      type: mongoose.Schema.ObjectId,
      ref: "Address",
      required: [true, "Address required"],
    },
    shippingFees: {
      type: Number,

    },
    subTotal: {
      type: Number,
    },
    total: {
      type: Number,
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed","Processing","Shipped","OutforDelivery","Delivered","Cancelled","Failed","Refunded","Returned","PartiallyShipped","OnHold"],
      default: "Pending",
    },
    DeliveredAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid","Failed","Declined","Cancelled","Refunded","PartiallyRefunded","Chargeback",],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "Paypal","Stripe"],
    },
    paidAt: {
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
  });

  next();
});

module.exports = orderModel;
