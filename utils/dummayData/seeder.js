const fs = require("fs");
require("colors");
const dotenv = require("dotenv");
const Country = require("../../models/countryModel");
// const Category = require('../models/categoryModel');
// const SubCategory = require('../models/subCategoryModel');
// const Brand = require('../models/brandModel');
const { dbConnection } = require("../../config/database");

dotenv.config({ path: "../../config.env" });

// connect to DB
dbConnection();

// Read data
const country = JSON.parse(fs.readFileSync("./countries.json"));

// Insert data into DB
const insertData = async () => {
  try {
    await Country.create(country);

    console.log("Data Inserted".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Country.deleteMany();
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
