const express = require("express");

const app = express();

const db = require("./models");
const User = db.User;

app.use(express.json());

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening...");
  User.findAll().then((users) => {
    console.log(users);
  });
});
