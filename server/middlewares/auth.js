// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT from HTTP-only cookie
const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token; // read token from cookie
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info (id + role)
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// Only allow Admins
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ msg: "Access denied. Admins only." });
  }
  next();
};

// Only allow Users
const isUser = (req, res, next) => {
  if (!req.user || req.user.role !== "User") {
    return res.status(403).json({ msg: "Access denied. Users only." });
  }
  next();
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token; // read token from cookie
    if (!token) return res.status(401).json({ msg: "No token provided" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info (id + role)
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};
module.exports = { auth, isAdmin, isUser,verifyToken };