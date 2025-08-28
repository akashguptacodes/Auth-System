// src/pages/Dashboard/AdminDashboard.jsx
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>
      <Link
        to="/admin/users"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Manage Users
      </Link>
    </div>
  );
}
