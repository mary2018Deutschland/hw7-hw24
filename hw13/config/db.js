import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export async function connectToDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connect to DB is ok");
  } catch (error) {
    console.error("Failed to connect to Mongo DB");
    throw error;
  }
}
