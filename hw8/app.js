import express from "express";
import "dotenv/config";
import sequelizeInstance from "./config/db.js";
import Book from "./models/Book.js";

const port = process.env.PORT;
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello world");
});
app.get("/books", async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    console.error("Error: ", error);
  }
});
app.post("/books", async (req, res) => {
  try {
    const { title, author, year } = req.body;
    if (!title || !author || !year) {
      return res.status(400).json({
        message: "all property must have",
      });
    }

    const newBook = await Book.create({
      title: title,
      author: author,
      year: year,
    });
    res.status(201).json({
      message: "Successfully added",
      book: newBook,
    });
  } catch (error) {
    console.error("Error: ", error);
  }
});

app.put("/books/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({
        message: "params not found",
      });
    }
    const { title, author, year } = req.body;
    const targetBook = await Book.findByPk(id);
    if (!targetBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }
    const updateData = {};
    if (title) {
      updateData.title = title;
    }
    if (author) {
      updateData.author = author;
    }
    if (year) {
      updateData.year = year;
    }
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No Data to update",
      });
    }
    await targetBook.update(updateData);
    res.status(201).json({
      message: "Book was successfully updated",
    });
  } catch (error) {
    console.error("Error: ", error);
  }
});

app.delete("/books/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({
        message: "params not found",
      });
    }
    const targetBook = await Book.findByPk(id);
    if (!targetBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    await targetBook.destroy();
    res.status(201).json({ message: "Book successfully deleted", targetBook });
  } catch (error) {
    const errObj = new Error(error.message);
    console.error("Error: ", errObj);
    next(errObj);
  }
});

app.listen(port, async () => {
  try {
    await sequelizeInstance.authenticate();
    console.log("Connected DB");
    console.log(`Server is running on: ${port}`);
  } catch (error) {
    console.error("Not connected to DB");
  }
});
