// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = "User",
      image = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + lastName)}`
    } = req.body;

    // Check if email already exists
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    // Limit number of Admins
    if (role === "Admin") {
      const count = await User.countAdmins();
      if (count >= 5) {
        return res.status(403).json({ msg: "Maximum 5 admins allowed" });
      }
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user in DB
    const userId = await User.create(firstName, lastName, email, hashed, role, image);

    res.status(201).json({
      msg: "User registered successfully",
      user: {
        id: userId,
        firstName,
        lastName,
        email,
        role,
        image,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set HTTP-only cookie
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000, // 1 hour
      })
      .json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// LOGOUT (optional)
exports.logout = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .json({ msg: "Logged out successfully" });
};
