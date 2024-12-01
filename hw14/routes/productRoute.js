import express from "express";
import createProduct from "../controllers/productController.js";
import getProducts from "../controllers/getProducts.js";

const router = express.Router();

router.post("/create_product", createProduct);
router.get("/get_all_products", getProducts);

export default router;
