const fs = require("fs");
require("colors");
const dotenv = require("dotenv");
const Footer = require("../../models/footerModel")
// const Banner = require("../../models/bannerModel")
// const HomepageSettings = require("../../models/homePageSettingsModel");
// const Category = require('../models/categoryModel');
// const SubCategory = require('../models/subCategoryModel');
// const Brand = require('../models/brandModel');
const { dbConnection } = require("../../config/database");

dotenv.config({ path: "../../config.env" });

// connect to DB
dbConnection();

// Read data
const footer = JSON.parse(fs.readFileSync("./footer.json"));

// Insert data into DB
const insertData = async () => {
  try {
    await Footer.create(footer);

    console.log("Data Inserted".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Footer.deleteMany();
    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node seeder.js -d
if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
