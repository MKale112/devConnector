const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI"); // with this we get any property in the default.json file

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("MongoDB connected.");
  } catch (err) {
    console.log(err.message);
    // exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
