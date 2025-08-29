const initDB = require("../config/db");
let db;

(async () => {
  db = await initDB();

  //  Ensure users table exists
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(100) NOT NULL,
      lastName VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('Admin','User') NOT NULL DEFAULT 'User',
      image VARCHAR(255) DEFAULT 'default.png',
      token VARCHAR(255),
      resetPasswordExpires DATETIME,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  //  Ensure profiles table exists
  await db.execute(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      gender VARCHAR(20),
      dateOfBirth DATE,
      about TEXT,
      contactNumber VARCHAR(20),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  //  Ensure at least one admin user exists
  const [admins] = await db.execute("SELECT * FROM users WHERE role = 'Admin' LIMIT 1");
  if (admins.length === 0) {
    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash("admin123", 10);
    await db.execute(
      "INSERT INTO users (firstName, lastName, email, password, role, image) VALUES (?, ?, ?, ?, ?, ?)",
      [
        "Default",
        "Admin",
        "admin@example.com",
        hashed,
        "Admin",
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          "Default" + " " + "Admin"
        )}`
      ]
    );
    console.log("Default admin created (email: admin@example.com, password: admin123)");
  }
})();

const User = {
  // 🔹 Create user
  create: async (firstName, lastName, email, password, role = "User", image = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + lastName)}`) => {
    const [result] = await db.execute(
      "INSERT INTO users (firstName, lastName, email, password, role, image) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, password, role, image]
    );
    return result.insertId;
  },

  countAdmins: async () => {
    const [[{ count }]] = await db.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'Admin'");
    return count;
  },

  // 🔹 Find user by email
  findByEmail: async (email) => {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  },

  // 🔹 Find user by id
  findById: async (id) => {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  // 🔹 Update reset token
  updateToken: async (id, token, expiry) => {
    await db.execute(
      "UPDATE users SET token = ?, resetPasswordExpires = ? WHERE id = ?",
      [token, expiry, id]
    );
  },

  // 🔹 Update password
  updatePassword: async (id, newPassword) => {
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [newPassword, id]);
  },

  // 🔹 Create or update profile
  upsertProfile: async (userId, { gender, dateOfBirth, about, contactNumber }) => {
    const [rows] = await db.execute("SELECT id FROM profiles WHERE userId = ?", [userId]);
    if (rows.length > 0) {
      await db.execute(
        "UPDATE profiles SET gender = ?, dateOfBirth = ?, about = ?, contactNumber = ? WHERE userId = ?",
        [gender, dateOfBirth, about, contactNumber, userId]
      );
    } else {
      await db.execute(
        "INSERT INTO profiles (userId, gender, dateOfBirth, about, contactNumber) VALUES (?, ?, ?, ?, ?)",
        [userId, gender, dateOfBirth, about, contactNumber]
      );
    }
  },

  // 🔹 Get user with profile
  findWithProfile: async (id) => {
    const [rows] = await db.execute(
      `SELECT u.*, p.gender, p.dateOfBirth, p.about, p.contactNumber
       FROM users u
       LEFT JOIN profiles p ON u.id = p.userId
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  },

  // 🔹 Get all users with profiles
  getAllWithProfiles: async () => {
    const [rows] = await db.execute(
      `SELECT u.*, p.gender, p.dateOfBirth, p.about, p.contactNumber
       FROM users u
       LEFT JOIN profiles p ON u.id = p.userId`
    );
    return rows;
  },

  // 🔹 Get all users (without profiles)
  getAll: async () => {
    const [rows] = await db.execute("SELECT * FROM users");
    return rows;
  },

  // 🔹 Update user
  update: async (id, data) => {
    const { firstName, lastName, email, password, role, image } = data;

    // base fields
    let fields = ["firstName = ?", "lastName = ?", "email = ?", "role = ?", "image = ?"];
    let values = [firstName, lastName, email, role, image];

    // only include password if provided
    if (password && password.trim() !== "") {
      fields.push("password = ?");
      values.push(password);
    }

    values.push(id);

    const [result] = await db.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },


  // 🔹 Delete user
  delete: async (id) => {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};

module.exports = User;
