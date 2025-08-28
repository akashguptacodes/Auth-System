// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="flex gap-4">
        <Link to="/" className="hover:text-gray-300">Home</Link>
        {user && (
          <Link to="/profile" className="hover:text-gray-300">
            Profile
          </Link>
        )}
      </div>
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-1 rounded"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="mr-2 hover:text-gray-300">Login</Link>
            <Link to="/register" className="hover:text-gray-300">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
