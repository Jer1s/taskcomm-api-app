require("dotenv").config();
const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = db.User;

const login = async (req, res, client) => {
  const { id, password } = req.body;
  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (password !== user.password) {
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

    // Redis에 refresh token 저장
    client.set(user.id, refreshToken);
    console.log(`client: ${client}`);

    // token 전송
    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      // JWT 토큰 검증
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Invalid token" });
        }
        req.userId = decoded.id;
        next();
      });
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const verifyRefreshToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const refresh_token = authHeader.split(" ")[1];
    // JWT 토큰 검증
    jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }
        const userId = decoded.id;
        // Redis에서 해당 userId에 저장된 Refresh Token 검색
        client.get(userId, (err, value) => {
          if (err || value !== refresh_token) {
            return res.status(403).json({ message: "Invalid refresh token" });
          }
          req.userId = userId;
          next();
        });
      }
    );
  } else {
    return res.status(401).json({ message: "Unauthorized" });
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
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    client.del(decoded.id);
    res.send({ message: "Logout Success" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  verifyToken,
  verifyRefreshToken,
  loginSuccess,
  logout,
};
