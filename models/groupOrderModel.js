const mongoose = require("mongoose");

const groupOrderSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
      required: [true, "Order required"],
    },

    store: {
      type: mongoose.Schema.ObjectId,
      ref: "Store",
      required: [true, "Store required"],
    },
    coupon: {
      type: mongoose.Schema.ObjectId,
      ref: "Coupon",
    },
    OrderItem: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "product required"],
        },
        variant: {
          type: mongoose.Schema.ObjectId,
          required: [true, "variant required"],
        },
        store: {
          type: mongoose.Schema.ObjectId,
          ref: "Store",
          required: [true, "store required"],
        },
        quantity: {
          type: Number,
          required: [true, "quantity required"],
        },
        shippingFee: {
          type: Number,
        },
        additionalFee: {
          type: Number,
          default: 0,
        },

        // Snapshot Fields
        snapshot: {
          productName: {
            type: String,
          },
          variantName: {
            type: String,
          },
          price: {
            type: Number,
            min: [0, "price cannot be negative"],
          },
          imageCover: {
            url: { type: String, required: [true, "image URL required"] },
            public_id: {
              type: String,
              required: [true, "image public ID required"],
            },
          },
          shippingFeeMethod: {
            type: String,
            enum: ["item", "weight", "fixed"],
          },
        },
        status: {
          type: String,
          enum: ["available", "unavailable", "out_of_stock"],
          default: "available",
        },

        // item status 
        productStatus:{
          type: String,
          enum: ["Pending", "Processing", "Shipped","Delivered","Canceled","Refunded","FailedDelivery","OnHold","Backordered","PartiallyShipped","ExchangeRequested","AwaitingPickup",],
          default: "Pending",
        },
        DeliveredAt: {
          type: Date,
        },
      },
    ],
    groupShippingFees: {
      type: Number,
      required: [true, "groupShippingFees required"],
    },
    groupSubTotal: {
      type: Number,
      required: [true, "groupSubTotal required"],
    },
    total: {
      type: Number,
      required: [true, "total required"],
    },
    shippingService: {
      type: String,
      required: [true, "shippingService required"],
    },
    shippingDeliveryMin: {
      type: String,
      required: [true, "shippingDeliveryMin required"],
    },
    shippingDeliveryMax: {
      type: String,
      required: [true, "shippingDeliveryMax required"],
    },
    groupOrderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "OutforDelivery",
        "Delivered",
        "Cancelled",
        "Failed",
        "Refunded",
        "Returned",
        "PartiallyShipped",
        "OnHold",
      ],
      default: "Pending",
    },
    DeliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const groupOrderModel = mongoose.model("GroupOrder", groupOrderSchema);


module.exports = groupOrderModel;
