const express = require("express");
const { register, login, logout } = require("../controllers/authController");
const { auth, isAdmin, verifyToken } = require("../middlewares/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});


router.get("/user-dashboard", auth, (req, res) => {
  res.json({ msg: "Welcome User!", user: req.user.username });
});


router.get("/admin-dashboard", auth, isAdmin, (req, res) => {
  res.json({ msg: "Welcome Admin!", admin: req.user.username });
});

module.exports = router;