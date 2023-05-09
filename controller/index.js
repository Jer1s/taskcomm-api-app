require("dotenv").config();

const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = db.User;

const login = async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // 입력한 비밀번호와 저장된 해시 비밀번호를 비교
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // access Token 발급
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // refresh Token 발급
    const refresh_token = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // token 전송
    res.cookie("accessToken", accessToken, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });

    res.cookie("refreshToken", refresh_token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });

    res.send({ message: "login success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const accessToken = (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = User.findOne({ where: { id: data.id } });

    res.send(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const refreshToken = (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    const data = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = User.findOne({ where: { id: data.id } });

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("accessToken", accessToken, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });

    res.send({ message: "Acess Token Recreated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const loginSuccess = (req, res) => {
  try {
    const token = req.cookies.accessToken;
    const data = jwt.verify(token, process.env.JWT_SECRET);

    const user = User.findOne({ where: { id: data.id } });

    res.send(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const logout = (req, res) => {
  console.log(req.cookie);
  try {
    req.cookie("accessToken", "");
    res.send({ message: "Logout Success" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  accessToken,
  refreshToken,
  loginSuccess,
  logout,
};
