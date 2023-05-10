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

    // access Token 생성
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // refresh Token 생성
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // token 전송
    res.cookie("accessToken", accessToken, {
      secure: true,
      sameSite: "None",
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      secure: true,
      sameSite: "None",
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    res.send({ message: "login success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }
    const accessToken = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (err) {
      console.error(err);
      return res.status(403).json({ message: "Invalid access token" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded.id);
    });
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const getNewTokens = async (refreshToken) => {
  try {
    const id = await verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(id);
    const newRefreshToken = generateRefreshToken(id);
    return { accessToken, refreshToken: newRefreshToken };
  } catch (err) {
    console.error(err);
    throw new Error("Invalid token");
  }
};

const getAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } = await getNewTokens(
      refreshToken
    );

    res.cookie("accessToken", accessToken, {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    res.cookie("refreshToken", newRefreshToken, {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(200).json({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

const loginSuccess = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ where: { id: data.id } });

    res.send(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.send({ message: "Logout Success" });
};

module.exports = {
  login,
  verifyAccessToken,
  getAccessToken,
  loginSuccess,
  logout,
};
