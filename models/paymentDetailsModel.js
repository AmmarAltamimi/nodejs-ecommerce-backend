const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
      required: [true, "Order required"],
    },
    paymentInetnetId: {
      type: String,
      required: [true, "Payment Intent ID required"], 
    },
    paymentMethod: {
      type: String,
      required: [true, "payment Method required"], 

    },
    status: {
      type: String,
      required: [true, "status required"], 

    },
    amount: {
      type: Number,
      required: [true, "amount required"], 

    },
    currency: {
      type: String,
      required: [true, "currency required"], 

    },
  },
  { timestamps: true }
);

const paymentDetailsModel = mongoose.model(
  "PaymentDetails",
  paymentDetailsSchema
);

module.exports = paymentDetailsModel;
