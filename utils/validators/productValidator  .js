const { check } = require("express-validator");

const {
  validatorMiddleware,
} = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");
const OfferTag = require("../../models/offerTagModel");
const Brand = require("../../models/brandModel");
const Product = require("../../models/productModel");
const Country = require("../../models/countryModel");
const Store = require("../../models/storeModel");
const {
  setSlug,
  ensureDocumentExistsById,
  ensureAllDocumentsExistByIds,
  ensureAllDocumentsBelongToParent,
  checkMaxImages,
  validateTypeDiscriminator,
  checkDiscountValue,
  ensureSingleDefaultVariant,
  ensureDocumentBelongToParent,
  ensureDocumentBelongToAllParent,
  isPriceLessThanOriginalPrice,
  isSaleExists,
  checkIfIsSaleExit,
  setSlugArray,
  ensureUniqueSubModelValueMultiObject,
  ensureNoFreeShippingForAll,
  ensureSubDocumentExistsById,
  validateUserOwnership,
  validateReferenceOwnership
} = require("./customValidator");

const createProductValidator = [
  check("subcategoryType")
    .notEmpty()
    .withMessage("subcategoryType required")
    .custom((val, { req }) => validateTypeDiscriminator(val, req)),
  check("title")
    .notEmpty()
    .withMessage("Product title required")
    .isLength({ min: 2 })
    .withMessage("too short product title")
    .isLength({ max: 32 })
    .withMessage("too long product title")
    .custom((val, { req }) => setSlug(val, req, Product)),
  check("description")
    .notEmpty()
    .withMessage("product description required")
    .isLength({ min: 10 })
    .withMessage("too short product description")
    .isLength({ max: 500 })
    .withMessage("too long product description"),
  check("specifications")
    .isArray()
    .withMessage("specifications is array")
    .optional(),
  check("questions").isArray().withMessage("questions is array").optional(),
  check("shippingFeeMethod")
    .notEmpty()
    .withMessage("shippingFeeMethod required"),
  check("freeShippingForSpecificCountries.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid freeShippingForSpecificCountries id format"),
  check("freeShippingForSpecificCountries")
    .optional()
    .isArray()
    .withMessage("freeShippingForSpecificCountries is array")
    .custom((countriesReceived, { req }) =>
      ensureAllDocumentsExistByIds(countriesReceived, req, Country)
    )
    .custom((val, { req }) => ensureNoFreeShippingForAll(val, req)),
  check("sold").optional().isInt().withMessage("sold is number"),
  check("view").optional().isInt().withMessage("view is number"),
  check("ratingsAverage").optional().isFloat({ min: 1, max: 5 }),
  check("ratingsQuantity").optional().isInt(),
  check("category")
    .notEmpty()
    .withMessage("category required")
    .isMongoId()
    .withMessage("Invalid category id format")
    .custom((val, { req }) => ensureDocumentExistsById(val, req, Category)),
  check("offerTag")
  .notEmpty()
  .withMessage("offerTag required")
  .isArray()
  .withMessage("offerTag is array")
  .custom((offerTagReceived, { req }) =>
  ensureAllDocumentsExistByIds(offerTagReceived, req, OfferTag)),
  check("subCategories")
    .notEmpty()
    .withMessage("subcategories required")
    .isArray()
    .withMessage("subcategories is array")
    .custom((subcategoriesReceived, { req }) =>
      ensureAllDocumentsExistByIds(subcategoriesReceived, req, SubCategory)
    )
    .custom(async (subcategoriesReceived, { req }) =>
      ensureAllDocumentsBelongToParent(
        subcategoriesReceived,
        req,
        SubCategory,
        {
          category: req.body.category,
        },
        req.body.category
      )
    ),
  check("subCategories.*")
    .isMongoId()
    .withMessage("Invalid subCategory id format"),

  check("brand")
    .notEmpty()
    .withMessage("brand required")
    .isMongoId()
    .withMessage("Invalid brand id format")
    .custom((val, { req }) => ensureDocumentExistsById(val, req, Brand))
    .custom((val, { req }) =>
      ensureDocumentBelongToParent(
        val,
        req,
        Brand,
        "category",
        req.body.category
      )
    )
    .custom((val, { req }) =>
      ensureDocumentBelongToAllParent(
        val,
        req,
        Brand,
        "subCategories",
        req.body.subCategories
      )
    ),
  check("store")
    .notEmpty()
    .withMessage("store required")
    .isMongoId()
    .withMessage("Invalid store id format")
    .custom((val, { req }) => validateUserOwnership(val, req, Store)),
];

// Validation for Men
const createMenValidation = [
  // check("variant").isArray().notEmpty().withMessage("enter the variant"),
  check("variant.*.defaultVariant")
  .custom((val, { req }) => ensureSingleDefaultVariant(val, req, Product)),
  check("variant.*.variantTitle")
    .notEmpty()
    .withMessage("variant title required")
    .isLength({ min: 2 })
    .withMessage("too short variant title")
    .isLength({ max: 32 })
    .withMessage("too long variant title")
    .custom((val, { req, path }) => setSlugArray(val, req, Product, path)),
  check("variant.*.variantDescription")
    .notEmpty()
    .withMessage("variantDescription description required")
    .isLength({ min: 10 })
    .withMessage("too short variantDescription description")
    .isLength({ max: 500 })
    .withMessage("too long variantDescription description"),
  check("variant.*.variantSpecifications")
    .optional()
    .isArray()
    .withMessage("variantSpecifications is array"),
  check("variant.*.keywords")
    .optional()
    .isArray()
    .withMessage("keywords is array"),
  check("variant.*.sku")
    .notEmpty()
    .withMessage("enter variant sku")
    .custom((val, { req }) =>
      ensureUniqueSubModelValueMultiObject(
        val,
        req,
        Product,
        false,
        {},
        "variant",
        "sku"
      )
    ),
  check("variant.*.price")
    .isFloat({ min: 0 })
    .withMessage("price must be less than 20000")
    .notEmpty()
    .withMessage("price required"),
  check("variant.*.originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .custom((val, { req, path }) =>
      isPriceLessThanOriginalPrice(val, req, path)
    )
    .custom((value, { req, path }) => isSaleExists(value, req, path)),
  check("variant.*.isSale")
    .optional()
    .custom((value, { req, path }) => checkIfIsSaleExit(value, req, path)),
  check("variant.*.saleEndDate")
    .optional()
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("saleEndDate is Date")
    .isAfter(new Date().toISOString())
    .withMessage("saleEndDate must be after the current date"),
  check("variant.*.discountType").optional(),
  check("variant.*.discountValue")
    .optional()
    .isFloat()
    .withMessage("discount Value must number")
    .custom((val, { req, path }) => checkDiscountValue(val, req, path)),

  check("variant.*.weight")
    .isInt()
    .withMessage("weight must be number")
    .notEmpty()
    .withMessage("weight is required"),

  check("variant.*.stockQuantity")
    .isInt({ min: 1 })
    .withMessage("phone Quantity must be at least 1")
    .notEmpty()
    .withMessage("phone Quantity is required"),
  check("variant.*.imageCover").custom((val, { req }) =>
    checkMaxImages(val, req)
  ),
  check("variant.*.color").notEmpty().withMessage("men Color is required"),

  check("variant.*.material")
    .notEmpty()
    .withMessage("men material is required"),

  check("variant.*.size").notEmpty().withMessage("men Size is required"),
];

// Validation for Women
const createWomenValidation = [
  // check("variant").isArray().notEmpty().withMessage("enter the variant"),
  check("variant.*.defaultVariant")
  .custom((val, { req }) => ensureSingleDefaultVariant(val, req, Product)),
  check("variant.*.variantTitle")
    .notEmpty()
    .withMessage("variant title required")
    .isLength({ min: 2 })
    .withMessage("too short variant title")
    .isLength({ max: 32 })
    .withMessage("too long variant title")
    .custom((val, { req, path }) => setSlugArray(val, req, Product, path)),
  check("variant.*.variantDescription")
    .notEmpty()
    .withMessage("variantDescription description required")
    .isLength({ min: 10 })
    .withMessage("too short variantDescription description")
    .isLength({ max: 500 })
    .withMessage("too long variantDescription description"),
  check("variant.*.variantSpecifications")
    .optional()
    .isArray()
    .withMessage("variantSpecifications is array"),
  check("variant.*.keywords")
    .optional()
    .isArray()
    .withMessage("keywords is array"),
  check("variant.*.sku")
    .notEmpty()
    .withMessage("enter variant sku")
    .custom((val, { req }) =>
      ensureUniqueSubModelValueMultiObject(
        val,
        req,
        Product,
        false,
        {},
        "variant",
        "sku"
      )
    ),
  check("variant.*.price")
    .isFloat({ min: 0 })
    .withMessage("price must be less than 20000")
    .notEmpty()
    .withMessage("price required"),
  check("variant.*.originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .custom((val, { req, path }) =>
      isPriceLessThanOriginalPrice(val, req, path)
    )
    .custom((value, { req, path }) => isSaleExists(value, req, path)),
  check("variant.*.isSale")
    .optional()
    .custom((value, { req, path }) => checkIfIsSaleExit(value, req, path)),
  check("variant.*.saleEndDate")
    .optional()
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("saleEndDate is Date")
    .isAfter(new Date().toISOString())
    .withMessage("saleEndDate must be after the current date"),
  check("variant.*.discountType").optional(),
  check("variant.*.discountValue")
    .optional()
    .isFloat()
    .withMessage("discount Value must number")
    .custom((val, { req, path }) => checkDiscountValue(val, req, path)),

  check("variant.*.weight")
    .isInt()
    .withMessage("weight must be number")
    .notEmpty()
    .withMessage("weight is required"),

  check("variant.*.stockQuantity")
    .isInt({ min: 1 })
    .withMessage("phone Quantity must be at least 1")
    .notEmpty()
    .withMessage("phone Quantity is required"),
  check("variant.*.imageCover").custom((val, { req }) =>
    checkMaxImages(val, req)
  ),

  check("variant.*.color").notEmpty().withMessage("women Color is required"),

  check("variant.*.material")
    .notEmpty()
    .withMessage("women material is required"),

  check("variant.*.size").notEmpty().withMessage("women Size is required"),
];

// Validation for Phone
const createPhoneValidation = [
  // check("variant").isArray().notEmpty().withMessage("enter the variant"),
  check("variant.*.defaultVariant")
  .custom((val, { req }) => ensureSingleDefaultVariant(val, req, Product)),
  check("variant.*.variantTitle")
    .notEmpty()
    .withMessage("variant title required")
    .isLength({ min: 2 })
    .withMessage("too short variant title")
    .isLength({ max: 32 })
    .withMessage("too long variant title")
    .custom((val, { req, path }) => setSlugArray(val, req, Product, path)),
  check("variant.*.variantDescription")
    .notEmpty()
    .withMessage("variantDescription description required")
    .isLength({ min: 10 })
    .withMessage("too short variantDescription description")
    .isLength({ max: 500 })
    .withMessage("too long variantDescription description"),
  check("variant.*.variantSpecifications")
    .optional()
    .isArray()
    .withMessage("variantSpecifications is array"),
  check("variant.*.keywords")
    .optional()
    .isArray()
    .withMessage("keywords is array"),
  check("variant.*.sku")
    .notEmpty()
    .withMessage("enter variant sku")
    .custom((val, { req }) =>
      ensureUniqueSubModelValueMultiObject(
        val,
        req,
        Product,
        false,
        {},
        "variant",
        "sku"
      )
    ),
  check("variant.*.price")
    .isFloat({ min: 0 })
    .withMessage("price must be less than 20000")
    .notEmpty()
    .withMessage("price required"),
  check("variant.*.originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .custom((val, { req, path }) =>
      isPriceLessThanOriginalPrice(val, req, path)
    )
    .custom((value, { req, path }) => isSaleExists(value, req, path)),
  check("variant.*.isSale")
    .optional()
    .custom((value, { req, path }) => checkIfIsSaleExit(value, req, path)),
  check("variant.*.saleEndDate")
    .optional()
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("saleEndDate is Date")
    .isAfter(new Date().toISOString())
    .withMessage("saleEndDate must be after the current date"),
  check("variant.*.discountType").optional(),
  check("variant.*.discountValue")
    .optional()
    .isFloat()
    .withMessage("discount Value must number")
    .custom((val, { req, path }) => checkDiscountValue(val, req, path)),

  check("variant.*.weight")
    .isInt()
    .withMessage("weight must be number")
    .notEmpty()
    .withMessage("weight is required"),

  check("variant.*.stockQuantity")
    .isInt({ min: 1 })
    .withMessage("phone Quantity must be at least 1")
    .notEmpty()
    .withMessage("phone Quantity is required"),
  check("variant.*.imageCover").custom((val, { req }) =>
    checkMaxImages(val, req)
  ),

  check("variant.*.color").notEmpty().withMessage("enter Phone color"),
  check("variant.*.storageCapacity")
    .notEmpty()
    .withMessage("enter Phone storageCapacity"),
  check("variant.*.screenSize")
    .notEmpty()
    .withMessage("enter Phone screenSize"),
  check("variant.*.ramSize").notEmpty().withMessage("enter Phone ramSize"),
  check("variant.*.networkType")
    .notEmpty()
    .withMessage("enter Phone networkType"),
  check("variant.*.operatingSystem")
    .notEmpty()
    .withMessage("enter Phone operatingSystem"),
  check("variant.*.batteryCapacity")
    .notEmpty()
    .withMessage("enter Phone batteryCapacity"),
];

// Validation for Laptop
const createLaptopValidation = [
  // check("variant").isArray().notEmpty().withMessage("enter the variant"),
  check("variant.*.defaultVariant")
  .custom((val, { req }) => ensureSingleDefaultVariant(val, req, Product)),
  check("variant.*.variantTitle")
    .notEmpty()
    .withMessage("variant title required")
    .isLength({ min: 2 })
    .withMessage("too short variant title")
    .isLength({ max: 32 })
    .withMessage("too long variant title")
    .custom((val, { req, path }) => setSlugArray(val, req, Product, path)),
  check("variant.*.variantDescription")
    .notEmpty()
    .withMessage("variantDescription description required")
    .isLength({ min: 10 })
    .withMessage("too short variantDescription description")
    .isLength({ max: 500 })
    .withMessage("too long variantDescription description"),
  check("variant.*.variantSpecifications")
    .optional()
    .isArray()
    .withMessage("variantSpecifications is array"),
  check("variant.*.keywords")
    .optional()
    .isArray()
    .withMessage("keywords is array"),
  check("variant.*.sku")
    .notEmpty()
    .withMessage("enter variant sku")
    .custom((val, { req }) =>
      ensureUniqueSubModelValueMultiObject(
        val,
        req,
        Product,
        false,
        {},
        "variant",
        "sku"
      )
    ),
  check("variant.*.price")
    .isFloat({ min: 0 })
    .withMessage("price must be less than 20000")
    .notEmpty()
    .withMessage("price required"),
  check("variant.*.originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .custom((val, { req, path }) =>
      isPriceLessThanOriginalPrice(val, req, path)
    )
    .custom((value, { req, path }) => isSaleExists(value, req, path)),
  check("variant.*.isSale")
    .optional()
    .custom((value, { req, path }) => checkIfIsSaleExit(value, req, path)),
  check("variant.*.saleEndDate")
    .optional()
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("saleEndDate is Date")
    .isAfter(new Date().toISOString())
    .withMessage("saleEndDate must be after the current date"),
  check("variant.*.discountType").optional(),
  check("variant.*.discountValue")
    .optional()
    .isFloat()
    .withMessage("discount Value must number")
    .custom((val, { req, path }) => checkDiscountValue(val, req, path)),

  check("variant.*.weight")
    .isInt()
    .withMessage("weight must be number")
    .notEmpty()
    .withMessage("weight is required"),

  check("variant.*.stockQuantity")
    .isInt({ min: 1 })
    .withMessage("phone Quantity must be at least 1")
    .notEmpty()
    .withMessage("phone Quantity is required"),
  check("variant.*.imageCover").custom((val, { req }) =>
    checkMaxImages(val, req)
  ),
  check("variant.*.color").notEmpty().withMessage("enter Laptop color  "),
  check("variant.*.ramSize").notEmpty().withMessage("enter Laptop ramSize "),
  check("variant.*.processorBrand")
    .notEmpty()
    .withMessage("enter Laptop processorBrand  "),
  check("variant.*.processorType")
    .notEmpty()
    .withMessage("enter Laptop processorType  "),
  check("variant.*.hardDiskCapacity")
    .notEmpty()
    .withMessage("enter Laptop hardDiskCapacity "),
  check("variant.*.storageType")
    .notEmpty()
    .withMessage("enter Laptop storageType  "),
  check("variant.*.operatingSystem")
    .notEmpty()
    .withMessage("enter Laptop operatingSystem  "),
  check("variant.*.screenSize")
    .notEmpty()
    .withMessage("enter Laptop screenSize "),
];

const updatedProductValidator = [
  check("id").isMongoId().withMessage("Invalid Product id format")
    .custom(async (id, { req }) =>
      validateReferenceOwnership(id, req, Product,"store")
    ),
  check("subcategoryType")
  .notEmpty()
  .withMessage("subcategoryType required")
  .custom((val, { req }) => validateTypeDiscriminator(val, req)),
  check("title")
    .optional()
    .isLength({ min: 2 })
    .withMessage("too short product title")
    .isLength({ max: 32 })
    .withMessage("too long product title")
    .custom((val, { req }) => setSlug(val, req, Product)),
  check("description")
    .optional()
    .isLength({ min: 10 })
    .withMessage("too short product description")
    .isLength({ max: 500 })
    .withMessage("too long product description"),
  check("specifications")
    .isArray()
    .withMessage("specifications is array")
    .optional(),
  check("questions").isArray().withMessage("questions is array").optional(),
  check("shippingFeeMethod").optional(),
  check("freeShippingForSpecificCountries.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid freeShippingForSpecificCountries id format"),
  check("freeShippingForSpecificCountries")
    .optional()
    .isArray()
    .withMessage("freeShippingForSpecificCountries is array")
    .custom((countriesReceived, { req }) =>
      ensureAllDocumentsExistByIds(countriesReceived, req, Country)
    )
    .custom((val, { req }) => ensureNoFreeShippingForAll(val, req)),
  check("sold").optional().isInt().withMessage("sold is number"),
  check("view").optional().isInt().withMessage("view is number"),
  check("ratingsAverage").optional().isFloat({ min: 1, max: 5 }),
  check("ratingsQuantity").optional().isInt(),
  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id format")
    .custom((val, { req }) => ensureDocumentExistsById(val, req, Category)),
  check("offerTag")
    .optional()
    .isMongoId()
    .withMessage("Invalid offerTag id format")
    .custom((val, { req }) => ensureDocumentExistsById(val, req, OfferTag)),
  check("subCategories")
    .optional()
    .isArray()
    .withMessage("subcategories is array")
    .custom((subcategoriesReceived, { req }) =>
      ensureAllDocumentsExistByIds(subcategoriesReceived, req, SubCategory)
    )
    .custom(async (subcategoriesReceived, { req }) =>
      ensureAllDocumentsBelongToParent(
        subcategoriesReceived,
        req,
        SubCategory,
        {
          category: req.body.category,
        },
        req.body.category
      )
    ),
  check("subCategories.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid subCategory id format"),

  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid brand id format")
    .custom((val, { req }) => ensureDocumentExistsById(val, req, Brand))
    .custom((val, { req }) =>
      ensureDocumentBelongToParent(
        val,
        req,
        Brand,
        "category",
        req.body.category
      )
    )
    .custom((val, { req }) =>
      ensureDocumentBelongToAllParent(
        val,
        req,
        Brand,
        "subCategories",
        req.body.subCategories
      )
    ),
  check("store")
    .optional()
    .isMongoId()
    .withMessage("Invalid store id format")
    .custom((val, { req }) => validateUserOwnership(val, req, Store)),
];


// Validation for Men
const updateMenValidation = [
  // check("variant").isArray().notEmpty().withMessage("enter the variant"),
  check("variant.*.defaultVariant")
  .custom((val, { req }) => ensureSingleDefaultVariant(val, req, Product)),
  check("variant.*.variantTitle")
    .optional()
    .isLength({ min: 2 })
    .withMessage("too short variant title")
    .isLength({ max: 32 })
    .withMessage("too long variant title")
    .custom((val, { req, path }) => setSlugArray(val, req, Product, path)),
  check("variant.*.variantDescription")
  .optional()
    .isLength({ min: 10 })
    .withMessage("too short variantDescription description")
    .isLength({ max: 500 })
    .withMessage("too long variantDescription description"),
  check("variant.*.variantSpecifications")
    .optional()
    .isArray()
    .withMessage("variantSpecifications is array"),
  check("variant.*.keywords")
    .optional()
    .isArray()
    .withMessage("keywords is array"),
  check("variant.*.sku")
    .optional()
    .custom((val, { req }) =>
      ensureUniqueSubModelValueMultiObject(
        val,
        req,
        Product,
        false,
        {},
        "variant",
        "sku"
      )
    ),
  check("variant.*.price")
    .isFloat({ min: 0 })
    .withMessage("price must be less than 20000")
    .optional(),
  check("variant.*.originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .custom((val, { req, path }) =>
      isPriceLessThanOriginalPrice(val, req, path)
    )
    .custom((value, { req, path }) => isSaleExists(value, req, path)),
  check("variant.*.isSale")
    .optional()
    .custom((value, { req, path }) => checkIfIsSaleExit(value, req, path)),
  check("variant.*.saleEndDate")
    .optional()
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("saleEndDate is Date")
    .isAfter(new Date().toISOString())
    .withMessage("saleEndDate must be after the current date"),
  check("variant.*.discountType").optional(),
  check("variant.*.discountValue")
    .optional()
    .isFloat()
    .withMessage("discount Value must number")
    .custom((val, { req, path }) => checkDiscountValue(val, req, path)),

  check("variant.*.weight")
    .isInt()
    .optional()
    .withMessage("weight is required"),

  check("variant.*.stockQuantity")
    .isInt({ min: 1 })
    .withMessage("phone Quantity must be at least 1")
    .optional(),
  check("variant.*.color").optional(),

  check("variant.*.material")
  .optional(),

  check("variant.*.size").optional(),
];


// Validation for Women
const updateWomenValidation = [
  // check("variant").isArray().notEmpty().withMessage("enter the variant"),
  check("variant.*.defaultVariant")
  .custom((val, { req }) => ensureSingleDefaultVariant(val, req, Product)),
  check("variant.*.defaultVariant")
  .custom((val, { req }) => ensureSingleDefaultVariant(val, req, Product)),
  check("variant.*.variantTitle")
  .optional()
    .isLength({ min: 2 })
    .withMessage("too short variant title")
    .isLength({ max: 32 })
    .withMessage("too long variant title")
    .custom((val, { req, path }) => setSlugArray(val, req, Product, path)),
  check("variant.*.variantDescription")
  .optional()
    .isLength({ min: 10 })
    .withMessage("too short variantDescription description")
    .isLength({ max: 500 })
    .withMessage("too long variantDescription description"),
  check("variant.*.variantSpecifications")
    .optional()
    .isArray()
    .withMessage("variantSpecifications is array"),
  check("variant.*.keywords")
    .optional()
    .isArray()
    .withMessage("keywords is array"),
  check("variant.*.sku")
  .optional()
    .custom((val, { req }) =>
      ensureUniqueSubModelValueMultiObject(
        val,
        req,
        Product,
        false,
        {},
        "variant",
        "sku"
      )
    ),
  check("variant.*.price")
    .isFloat({ min: 0 })
    .withMessage("price must be less than 20000")
    .optional(),
  check("variant.*.originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .custom((val, { req, path }) =>
      isPriceLessThanOriginalPrice(val, req, path)
    )
    .custom((value, { req, path }) => isSaleExists(value, req, path)),
  check("variant.*.isSale")
    .optional()
    .custom((value, { req, path }) => checkIfIsSaleExit(value, req, path)),
  check("variant.*.saleEndDate")
    .optional()
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("saleEndDate is Date")
    .isAfter(new Date().toISOString())
    .withMessage("saleEndDate must be after the current date"),
  check("variant.*.discountType").optional(),
  check("variant.*.discountValue")
    .optional()
    .isFloat()
    .withMessage("discount Value must number")
    .custom((val, { req, path }) => checkDiscountValue(val, req, path)),

  check("variant.*.weight")
    .isInt()
    .withMessage("weight must be number")
    .optional(),

  check("variant.*.stockQuantity")
    .isInt({ min: 1 })
    .withMessage("phone Quantity must be at least 1")
    .optional(),


  check("variant.*.color").optional(),

  check("variant.*.material")
    .notEmpty()
    .withMessage("women material is required"),

  check("variant.*.size").optional(),
];


// Validation for Phone
const updatePhoneValidation = [
  // check("variant").isArray().notEmpty().withMessage("enter the variant"),
  check("variant.*.defaultVariant")
  .custom((val, { req }) => ensureSingleDefaultVariant(val, req, Product)),
  check("variant.*.variantTitle")
  .optional()
    .isLength({ min: 2 })
    .withMessage("too short variant title")
    .isLength({ max: 32 })
    .withMessage("too long variant title")
    .custom((val, { req, path }) => setSlugArray(val, req, Product, path)),
  check("variant.*.variantDescription")
  .optional()
    .isLength({ min: 10 })
    .withMessage("too short variantDescription description")
    .isLength({ max: 500 })
    .withMessage("too long variantDescription description"),
  check("variant.*.variantSpecifications")
    .optional()
    .isArray()
    .withMessage("variantSpecifications is array"),
  check("variant.*.keywords")
    .optional()
    .isArray()
    .withMessage("keywords is array"),
  check("variant.*.sku")
  .optional()
    .custom((val, { req }) =>
      ensureUniqueSubModelValueMultiObject(
        val,
        req,
        Product,
        req.params.id,
        {},
        "variant",
        "sku"
      )
    ),
  check("variant.*.price")
    .isFloat({ min: 0 })
    .withMessage("price must be less than 20000")
    .optional(),
  check("variant.*.originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .custom((val, { req, path }) =>
      isPriceLessThanOriginalPrice(val, req, path)
    )
    .custom((value, { req, path }) => isSaleExists(value, req, path)),
  check("variant.*.isSale")
    .optional()
    .custom((value, { req, path }) => checkIfIsSaleExit(value, req, path)),
  check("variant.*.saleEndDate")
    .optional()
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("saleEndDate is Date")
    .isAfter(new Date().toISOString())
    .withMessage("saleEndDate must be after the current date"),
  check("variant.*.discountType").optional(),
  check("variant.*.discountValue")
    .optional()
    .isFloat()
    .withMessage("discount Value must number")
    .custom((val, { req, path }) => checkDiscountValue(val, req, path)),

  check("variant.*.weight")
    .isInt()
    .withMessage("weight must be number")
    .optional(),

  check("variant.*.stockQuantity")
    .isInt({ min: 1 })
    .withMessage("phone Quantity must be at least 1")
    .optional(),

  check("variant.*.color").optional(),
  check("variant.*.storageCapacity")
  .optional(),
  check("variant.*.screenSize")
  .optional(),
  check("variant.*.ramSize").optional(),
  check("variant.*.networkType")
  .optional(),
  check("variant.*.operatingSystem")
  .optional(),
  check("variant.*.batteryCapacity")
  .optional(),
];


// Validation for Laptop
const updateLaptopValidation = [
  // check("variant").isArray().notEmpty().withMessage("enter the variant"),
  check("variant.*.variantTitle")
  .optional()
    .isLength({ min: 2 })
    .withMessage("too short variant title")
    .isLength({ max: 32 })
    .withMessage("too long variant title")
    .custom((val, { req, path }) => setSlugArray(val, req, Product, path)),
  check("variant.*.variantDescription")
  .optional()
    .isLength({ min: 10 })
    .withMessage("too short variantDescription description")
    .isLength({ max: 500 })
    .withMessage("too long variantDescription description"),
  check("variant.*.variantSpecifications")
    .optional()
    .isArray()
    .withMessage("variantSpecifications is array"),
  check("variant.*.keywords")
    .optional()
    .isArray()
    .withMessage("keywords is array"),
  check("variant.*.sku")
  .optional()
    .custom((val, { req }) =>
      ensureUniqueSubModelValueMultiObject(
        val,
        req,
        Product,
        false,
        {},
        "variant",
        "sku"
      )
    ),
  check("variant.*.price")
    .isFloat({ min: 0 })
    .withMessage("price must be less than 20000")
    .optional(),
  check("variant.*.originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .custom((val, { req, path }) =>
      isPriceLessThanOriginalPrice(val, req, path)
    )
    .custom((value, { req, path }) => isSaleExists(value, req, path)),
  check("variant.*.isSale")
    .optional()
    .custom((value, { req, path }) => checkIfIsSaleExit(value, req, path)),
  check("variant.*.saleEndDate")
    .optional()
    .isDate({ format: "MM/DD/YYYY" })
    .withMessage("saleEndDate is Date")
    .isAfter(new Date().toISOString())
    .withMessage("saleEndDate must be after the current date"),
  check("variant.*.discountType").optional(),
  check("variant.*.discountValue")
    .optional()
    .isFloat()
    .withMessage("discount Value must number")
    .custom((val, { req, path }) => checkDiscountValue(val, req, path)),

  check("variant.*.weight")
    .isInt()
    .withMessage("weight must be number")
    .optional(),

  check("variant.*.stockQuantity")
    .isInt({ min: 1 })
    .withMessage("phone Quantity must be at least 1")
    .optional(),

  check("variant.*.color").optional(),
  check("variant.*.ramSize").optional(),
  check("variant.*.processorBrand")
  .optional(),
  check("variant.*.processorType")
  .optional(),
  check("variant.*.hardDiskCapacity")
  .optional(),
  check("variant.*.storageType")
  .optional(),
  check("variant.*.operatingSystem")
  .optional(),
  check("variant.*.screenSize")
  .optional(),
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format")
  .custom(async (id, { req }) =>
    validateReferenceOwnership(id, req, Product,"store")
  ),
  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format"),
  check("variantId").isMongoId().withMessage("Invalid variant id format")
  .custom((val, { req }) => ensureSubDocumentExistsById(val, req, Product, {_id: req.params.id},"variant")),
  validatorMiddleware,
];

exports.getFilterOptionsValidator = [
  check("subcategoryType")
  .notEmpty()
  .withMessage("subcategoryType required")
  .custom((val, { req }) => validateTypeDiscriminator(val, req)),
  validatorMiddleware,
];

// create Conditional validation loader and Middleware to dynamically load validations
const createConditionalValidation = (req) => {
  switch (req.body.subcategoryType) {
    case "men":
      return createMenValidation;

    case "phone":
      return createPhoneValidation;

    case "laptop":
      return createLaptopValidation;

    case "women":
      return createWomenValidation;

    default:
      return [];
  }
};

exports.applyCreateValidations = async (req, res, next) => {
  const validations = [
    ...createProductValidator,
    ...createConditionalValidation(req),
  ];
  await Promise.all(validations.map((validation) => validation.run(req)));
  validatorMiddleware(req, res, next);
};

// update Conditional validation loader and Middleware to dynamically load validations
const updateConditionalValidation = (req) => {
  switch (req.body.subcategoryType) {
    case "men":
      return updateMenValidation;

    case "phone":
      return updatePhoneValidation;

    case "laptop":
      return updateLaptopValidation;

    case "women":
      return updateWomenValidation;

    default:
      return [];
  }
};

exports.applyUpdateValidations = async (req, res, next) => {
  const validations = [
    ...updatedProductValidator,
    ...updateConditionalValidation(req),
  ];
  await Promise.all(validations.map((validation) => validation.run(req)));
  validatorMiddleware(req, res, next);
};













// // common update vatiant validator

// const commonUpdateVariantValidator = [
//   check("id").isMongoId().withMessage("Invalid product id format"),
//   check("variantId").isMongoId().withMessage("Invalid product id format"),
//   check("subcategoryType")
//     .notEmpty()
//     .withMessage("subcategoryType required")
//     .custom((val, { req }) => validateTypeDiscriminator(val, req)),
// ];
