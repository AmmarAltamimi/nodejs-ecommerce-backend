const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "user name required"],
      minlength: [2, "too short user name"],
      maxlength: [32, "too long user name"],
      trim: true,

    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "user email required"],
      unique: [true, "email must be unique"],
    },
    phone: {
      type: String,
    },
    // profileImg : {}
    password: {
      type: String,
      required: [true, "password required"],
      minlength: [8, "too short password"],
      maxlength: [64, "too long password"],
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetCode: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    passwordResetVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    profileImg: {
        url: {type:String},       // The image URL you will use in your app
        public_id:{type:String},  // The public ID for future reference
      },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],

    addresses: [
      {
        id: mongoose.Schema.Types.ObjectId,
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
    ],
  },
  { timestamps: true }
);

// Hash the password before saving the user document
userSchema.pre("save", async function (next) {

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
