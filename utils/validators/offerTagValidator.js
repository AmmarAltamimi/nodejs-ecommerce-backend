const { check } = require("express-validator");
const { validatorMiddleware } = require("../../middlewares/validatorMiddleware");
const OfferTag = require("../../models/offerTagModel");
const { ensureUniqueModelValue, setSlug } = require("./customValidator");

exports.createOfferTagValidator = [
  check("name")
    .notEmpty()
    .withMessage("offerTag required")
    .isLength({ min: 3 })
    .withMessage("too short offerTag name")
    .isLength({ max: 32 })
    .withMessage("too long offerTag name")
    .custom((val, { req }) => ensureUniqueModelValue(val, req,false, OfferTag,{name:val}))
    .custom((val, { req }) => setSlug(val, req,OfferTag)),

  validatorMiddleware,
];

exports.updateOfferTagValidator = [
  check("id").isMongoId().withMessage("Invalid offerTag id format"),
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("too short offerTag name")
    .isLength({ max: 32 })
    .withMessage("too long offerTag name")
    .custom((val, { req }) => ensureUniqueModelValue(val, req, req.params.id,OfferTag,{name:val}))
    .custom((val, { req }) => setSlug(val, req,OfferTag)),
  validatorMiddleware,
];

exports.deleteOfferTagValidator = [
  check("id").isMongoId().withMessage("Invalid offerTag id format"),
  validatorMiddleware,
];

exports.getOfferTagValidator = [
  check("id").isMongoId().withMessage("Invalid offerTag id format"),
  validatorMiddleware,
];
