const { check } = require("express-validator");
const { validatorMiddleware } = require("../../middlewares/validatorMiddleware");
const Cart = require("../../models/cartModel");
const Store = require("../../models/storeModel");
const Address = require("../../models/addressModel");
const { ensureDocumentExistsById,validateUserOwnership } = require("./customValidator");

exports.createOrderValidator = [
  check("cart")
    .notEmpty()
    .withMessage("cartId required")
    .isMongoId()
    .withMessage("Invalid cart id format")
    .custom((val, { req }) => ensureDocumentExistsById(val, req, Cart)),
    check("address")
    .notEmpty()
    .withMessage("addressId required")
    .isMongoId()
    .withMessage("Invalid address id format")
    .custom((val, { req }) => validateUserOwnership(val, req, Address)),

  validatorMiddleware,
];


exports.storeGroupValidator = [
  check("storeId").isMongoId().withMessage("Invalid store id format")
  .custom((val, { req }) => validateUserOwnership(val, req, Store)),
  validatorMiddleware,
];

exports.orderValidator = [
  check("id").isMongoId().withMessage("Invalid order id format"),
  validatorMiddleware,
];

exports.updateGroupOrderValidator = [
  check("groupId").isMongoId().withMessage("Invalid group id format"),
  validatorMiddleware,
];

exports.updateItemOrderValidator = [
  check("groupId").isMongoId().withMessage("Invalid group id format"),
  check("itemId").isMongoId().withMessage("Invalid item id format"),
  validatorMiddleware,
];



