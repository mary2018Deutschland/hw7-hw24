import "dotenv/config";
import { MongoClient } from "mongodb";

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

let dbConnection;
export async function connectToDB() {
  try {
    await client.connect();
    console.log("Connection to DB is successfull");
    dbConnection = client.db();
  } catch (error) {
    console.error("Failed to connect to MongoDb: ", error);
    throw error;
  }
}

export function getDB() {
  if (!dbConnection) {
    throw new Error("DataBase is not connected");
  }
  return dbConnection;
}
