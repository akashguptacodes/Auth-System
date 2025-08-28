const express = require("express");
const dotenv=require("dotenv");
dotenv.config();
const cors = require("cors");
const initDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const startServer = async () => {
  const app = express();

  // Enable CORS for all origins (you can restrict it to your frontend later)
  app.use(cors({
    origin: process.env.FRONTEND_URL, // your Vite frontend URL
    credentials: true // if you send cookies
  }));

  app.use(express.json());
  const cookieParser = require("cookie-parser");
app.use(cookieParser());


  // Init DB
  const db = await initDB();
  app.set("db", db); // optional: store in app for global use

  // Routes
  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
