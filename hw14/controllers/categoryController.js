import Category from "../models/categories.js";

async function createCategory(req, res) {
  try {
    const category1 = new Category(req.body);
    await category1.save();
    res.status(201).json(category1);
  } catch (error) {
    res.status(400).json({ error: err.message });
    console.error("Category was not created", error);
  }
}
export default createCategory;
