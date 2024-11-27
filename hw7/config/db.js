import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USERNAME,
  process.env.PASSWORD,

  { host: process.env.HOST, dialect: process.env.DIALECT }
);

export default sequelize;
