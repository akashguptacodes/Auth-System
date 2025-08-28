// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Find user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Find user by Email
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, role, image } = req.body;

    // Build update data object
    const updateData = {
      firstName,
      lastName,
      email,
      role,
      image,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updated = await User.update(id, updateData);

    if (!updated) {
      return res.status(404).json({ msg: "User not found or not updated" });
    }

    res.json({ msg: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.delete(id);

    if (!deleted) {
      return res.status(404).json({ msg: "User not found or already deleted" });
    }

    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
