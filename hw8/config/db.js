import { Sequelize } from "sequelize";
import configData from "./config.json" assert { type: "json" };

const env = process.env.NODE_ENV || "development";
const config = configData[env];

const sequelizeInstance = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);

export default sequelizeInstance;
