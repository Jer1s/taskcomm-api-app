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

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.userId = decoded.id;
      next();
    });
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
