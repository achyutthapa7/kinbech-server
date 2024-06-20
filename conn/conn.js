import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Connected to database successfully");
  })
  .catch((err) => {
    console.log(`Error while connecting to database: ${err.message}`);
  });
