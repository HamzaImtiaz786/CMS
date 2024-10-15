const mongoose = require("mongoose");

const connectDB = async () => {
  console.log('process.env.MONGODB_URI>>>',process.env.MONGODB_URI)
  
  return mongoose
    .connect(process.env.MONGODB_URI)

    .then(() => console.log(`connection to database established...`))
    .catch((err) => console.log('err11111111',err));
};

module.exports = connectDB;

