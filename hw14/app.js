import express from "express";
import cors from "cors";
import "dotenv/config";
import connectToDB from "./db/index.js";
import categoryRoute from "./routes/categotyRoute.js";
import productRoute from "./routes/productRoute.js";

const port = process.env.PORT;
const mongoDB = process.env.MONGO_URI;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", categoryRoute);
app.use("/api", productRoute);

connectToDB();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
