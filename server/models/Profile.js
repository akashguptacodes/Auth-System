const initDB = require("./db");
let db;

(async () => {
  db = await initDB();

  // ✅ Ensure profiles table exists with relation to users
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
      CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
})();

const Profile = {
  create: async (userId, gender, dateOfBirth, about, contactNumber) => {
    const [result] = await db.execute(
      "INSERT INTO profiles (userId, gender, dateOfBirth, about, contactNumber) VALUES (?, ?, ?, ?, ?)",
      [userId, gender, dateOfBirth, about, contactNumber]
    );
    return result.insertId;
  },

  findByUserId: async (userId) => {
    const [rows] = await db.execute("SELECT * FROM profiles WHERE userId = ?", [userId]);
    return rows[0];
  },

  update: async (userId, fields) => {
    const updates = [];
    const values = [];
    for (let key in fields) {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    }
    values.push(userId);

    await db.execute(
      `UPDATE profiles SET ${updates.join(", ")} WHERE userId = ?`,
      values
    );
  },

  delete: async (userId) => {
    await db.execute("DELETE FROM profiles WHERE userId = ?", [userId]);
  }
};

module.exports = Profile;