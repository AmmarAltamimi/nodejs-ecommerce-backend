const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const { createToken } = require("../utils/createToken");

const {
  getAll,
  getOne,
  createOne,
  deleteOne,
} = require("../middlewars/handlersFactoryMiddleware");

exports.getLoggedUserData = async (req, res,next) => {
  if (req.user._id) {
    req.params.id = req.user._id;
  }
  next()
};

//admin
exports.getUsers = getAll(User);
exports.createUser = createOne(User);
exports.updateUser = asyncHandler(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      role: req.body.role,
    },
    { new: true }
  );

  if (!updateUser) {
    return next(new ApiError(`there is no user with id ${req.params.id}`, 404));
  }

  res.status(200).json({ status: "success", data: updateUser });
});
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
    const updatePassword = await User.findByIdAndUpdate(
      req.params.id,
      {
        password: await bcrypt.hash(req.body.password, 12),
        passwordChangedAt: Date.now(),
      },
      { new: true }
    );
  
    if (!updatePassword) {
      return next(new ApiError(`there is no user with id ${req.params.id}`, 404));
    }
  
    res.status(200).json({ status: "success", data: updatePassword });
  });
  
exports.deleteUser = deleteOne(User);
exports.getUser = getOne(User);

//user

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateLoggedUserData = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  if (!updateLoggedUserData) {
    return next(new ApiError(`there is no user with id ${req.user._id}`, 404));
  }

  res.status(200).json({ status: "success", data: updateLoggedUserData });
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const updatePassword = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  if (!updatePassword) {
    return next(new ApiError(`there is no user with id ${req.user._id}`, 404));
  }

  // generate Token

    const token = createToken(req.user._id);

  

  res.status(200).json({ status: "success", data: updatePassword, token: token });
});


exports.activateLoggedUser = asyncHandler(async (req, res, next) => {
  const activate = await User.findByIdAndUpdate(
    req.user._id,
    {
      active: true,
    },
    { new: true }
  );

  if (!activate) {
    return next(new ApiError(`there is no user with id ${req.user._id}`, 404));
  }

  res.status(200).json({ status: "success", data: activate });
});

exports.deactivateLoggedUser = asyncHandler(async (req, res, next) => {
  const deactivate = await User.findByIdAndUpdate(
    req.user._id,
    {
      active: false,
    },
    { new: true }
  );

  if (!deactivate) {
    return next(new ApiError(`there is no user with id ${req.user._id}`, 404));
  }

  res.status(200).json({ status: "success", data: deactivate });
});
