const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const { username, password, database, host, dialect } = config;
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
});

const User = require("./user")(sequelize, Sequelize.DataTypes);

const db = {};
db.User = User;

module.exports = db;
