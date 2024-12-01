import Product from "../models/products.js";

async function createProduct(req, res) {
  try {
    const product1 = new Product(req.body);
    await product1.save();
    res.status(201).json(product1);
  } catch (error) {
    res.status(400).json({ error: err.message });
    console.error("Product was not created", error);
  }
}

export default createProduct;
