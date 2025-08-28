// src/api/auth.js
import axios from "axios";

// Axios instance with credentials enabled
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  withCredentials: true, // send cookies with every request
});

// Login user: sends credentials to backend
export const loginUser = async (credentials) => {
  try {
    const res = await API.post("/auth/login", credentials);
    return res.data; // { user: { id, role, ... } }
  } catch (err) {
    throw err.response?.data || { msg: "Login failed" };
  }
};

// Register user
export const registerUser = async (data) => {
  try {
    const res = await API.post("/auth/register", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { msg: "Registration failed" };
  }
};

// Get current user from backend using token cookie
export const getCurrentUser = async () => {
  try {
    const res = await API.get("/auth/me"); // cookie sent automatically
    return res.data.user; // { id, role, ... }
  } catch (err) {
    // If token invalid or missing, return null
    return null;
  }
};
