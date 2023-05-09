require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const {
  login,
  verifyToken,
  verifyRefreshToken,
  loginSuccess,
  logout,
} = require("./controller");
const db = require("./models");
const cors = require("cors");

const app = express();

const User = db.User;
const Post = db.Post;

app.use(
  cors({
    origin: "https://deploy-preview-2--taskcomm.netlify.app",
    methods: "GET, POST, OPTIONS, PUT, DELETE, PATCH",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// // Login
app.post("/login", login);
app.get("/login/success", loginSuccess);
app.post("/logout", logout);

// CRUD
app.get("/", (req, res) => {
  res.send({ message: "URL should contain /api/.." });
});

app.get("/api/users", async (req, res) => {
  try {
    const Users = await User.findAll();
    res.send(Users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ where: { id } });
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ message: "There is no such user" });
  }
});

app.post("/api/users", async (req, res) => {
  const newUser = req.body;
  const user = await User.create(newUser);
  res.send(user);
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const newInfo = req.body;
  const result = await User.update(newInfo, { where: { id } });
  if (result[0]) {
    res.send({ message: `${result[0]} row(s) affected` });
  } else {
    res.status(404).send({ message: "There is no user with the id!" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const deleteCount = await User.destroy({ where: { id } });
  if (deleteCount) {
    res.send({ message: `${deleteCount} row(s) deleted ` });
  } else {
    res.status(404).send({ message: "There is no user with the id!" });
  }
});

app.get("/api/posts", async (req, res) => {
  const { userId } = req.query;
  if (userId) {
    const ownPosts = await Post.findAll({ where: { user_id: userId } });
    res.send(ownPosts);
  } else {
    const Posts = await Post.findAll();
    res.send(Posts);
  }
});

app.get("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOne({ where: { id } });
  if (post) {
    res.send(post);
  } else {
    res.status(404).send({ message: "There is no such post" });
  }
});

app.post("/api/posts", async (req, res) => {
  const newPost = req.body;
  const post = await Post.create(newPost);
  res.send(post);
});

app.put("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const newInfo = req.body;
  const result = await Post.update(newInfo, { where: { id } });
  if (result[0]) {
    res.send({ message: `${result[0]} row(s) affected` });
  } else {
    res.status(404).send({ message: "There is no user with the id!" });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  const { id } = req.params;
  const deleteCount = await Post.destroy({ where: { id } });
  if (deleteCount) {
    res.send({ message: `${deleteCount} row(s) deleted ` });
  } else {
    res.status(404).send({ message: "There is no user with the id!" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is on ${process.env.PORT}`);
});
