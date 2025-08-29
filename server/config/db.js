const mysql = require("mysql2/promise");
const fs = require("fs");

const initDB = async () => {
  try {
    // 1. connect without specifying database (to create it first)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password:   process.env.DB_PASS,
      port: process.env.DB_PORT,
      ssl: {
        ca: fs.readFileSync("./config/ca.pem") // path to downloaded certificate
  }
    });

    // 2. Create database if not exists
    await connection.query("CREATE DATABASE IF NOT EXISTS defaultdb");
    console.log("Database ensured: defaultdb");

    // 3. Create pool connection for queries
    const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,          // important
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync("./config/ca.pem")
  }
});

    // 4. Create users table if not exists
    await pool.query(`
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

    console.log("Table ensured: users");

    return pool;
  } catch (err) {
    console.error("❌ DB init error:", err);
    process.exit(1);
  }
};

module.exports = initDB;