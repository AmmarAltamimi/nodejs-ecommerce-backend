const { check } = require("express-validator");
const { validatorMiddleware } = require("../../middlewares/validatorMiddleware");
const Coupon = require("../../models/couponModel");
const Store = require("../../models/storeModel");
const { ensureUniqueModelValue,ensureDocumentExistsById,ensureStartDateLessThanExpireDate } = require("./customValidator");

exports.createCouponValidator = [
  check("name")
    .notEmpty()
    .withMessage("coupon required")
    .isLength({ min: 2 })
    .withMessage("too short coupon name")
    .isLength({ max: 50 })
    .withMessage("too long coupon name")
    .custom((val, { req }) => ensureUniqueModelValue(val, req, false,Coupon,{name:val})),
    check("start")
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("start date is Date")
    .isBefore(new Date().toISOString())
    .withMessage("start date must be before the current date")
    .custom((val, { req }) => ensureStartDateLessThanExpireDate(val, req))
    .notEmpty()
    .withMessage("start date required"),
  check("expire")
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("coupon is Date")
    .isAfter(new Date().toISOString())
    .withMessage("Expiration date must be after the current date")
    .notEmpty()
    .withMessage("expire date required"),
    check("store")
    .notEmpty()
    .withMessage("store required")
    .isMongoId()
    .withMessage("Invalid store id format")
    .custom((val, req) => ensureDocumentExistsById(val, req, Store)),
  check("discount")
    .isInt({ min: 0, max: 100 })
    .withMessage("discount percentage must be betwenn 0 and 100")
    .notEmpty()
    .withMessage("discount percentage required"),
  validatorMiddleware,
];

exports.updateCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon id format"),
  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("too short coupon name")
    .isLength({ max: 50 })
    .withMessage("too long coupon name")
    .custom((val, { req }) => ensureUniqueModelValue(val, req, req.params.id,Coupon,{name:val})),
    check("start")
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("start date is Date")
    .custom((val, { req }) => ensureStartDateLessThanExpireDate(val, req))
    .optional(),
  check("expire")
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("coupon is Date")
    .isAfter(new Date().toISOString())
    .withMessage("Expiration date must be after the current date")
    .optional(),
    check("store")
    .optional()
    .isMongoId()
    .withMessage("Invalid store id format")
    .custom((val, req) => ensureDocumentExistsById(val, req, Store)),
  check("discount")
    .isInt({ min: 0, max: 100 })
    .withMessage("discount percentage must be betwenn 0 and 100")
    .optional(),
  validatorMiddleware,
];

exports.deleteCouponValidator = [
  check("id").isMongoId().withMessage("Invalid coupon id format"),
  validatorMiddleware,
];

exports.getCouponValidator = [
  check("id").isMongoId().withMessage("Invalid coupon id format"),
  validatorMiddleware,
];
