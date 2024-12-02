import sequelizeInstance from "../config/db.js";
import { DataTypes } from "sequelize";

const Book = sequelizeInstance.define(
  "Book",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "Books",
    timestamps: false,
  }
);

export default Book;
