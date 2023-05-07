const express = require("express");

const app = express();

const db = require("./models");

app.use(express.json());

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening...");
});
