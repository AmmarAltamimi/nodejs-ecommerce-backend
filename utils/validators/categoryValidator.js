const { check } = require("express-validator");
const {
  validatorMiddleware,
} = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");
const { valueAlreadyExists, setSlug ,checkSingleImage} = require("./customValidator");

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("category required")
    .isLength({ min: 3 })
    .withMessage("too short category name")
    .isLength({ max: 32 })
    .withMessage("too long category name")
    .custom((val, { req }) => valueAlreadyExists(val, req, Category))
    .custom((val, { req }) => setSlug(val, req)),
    check("image").custom((val,{req})=>checkSingleImage(val,req)),

  validatorMiddleware,
];


exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("too short category name")
    .isLength({ max: 32 })
    .withMessage("too long category name")
    .custom((val, { req }) => valueAlreadyExists(val, req, Category))
    .custom((val, { req }) => setSlug(val, req)),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
