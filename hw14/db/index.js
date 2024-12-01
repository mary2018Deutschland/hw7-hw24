import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.MONGO_URI;

async function connectToDB() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error, "Not connected to MongoDB");
    process.exit(1);
  }
}

export default connectToDB;
