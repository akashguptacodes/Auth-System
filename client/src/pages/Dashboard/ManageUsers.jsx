import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function ManageUsers() {
  const {user}=useAuth();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // user being edited
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "User",
    image: "",
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Start editing a user
  const editUser = (user) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "", // empty, only fill if changing
      role: user.role,
      image: user.image,
    });
  };

  // Submit update to backend
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/user/${editingUser.id}`,
        form,
        { withCredentials: true }
      );
      alert("User updated successfully");
      setEditingUser(null);
      fetchUsers(); // refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  // const handleDelete = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this user?")) return;
  //   try {
  //     await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/user/delete/${id}`, {
  //       withCredentials: true,
  //     });
  //     setUsers(users.filter((u) => u.id !== id));
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to delete user");
  //   }
  // };


const handleDelete = async (id) => {
  // Suppose you have logged-in user info in state/context
  // e.g., currentUser = { id: "...", email: "..." }
  if (id === user.id) {
    alert("You cannot delete your own account.");
    return;
  }

  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/user/delete/${id}`, {
      withCredentials: true,
    });

    setUsers(users.filter((u) => u.id !== id));
  } catch (err) {
    console.error(err);
    alert("Failed to delete user");
  }
};



  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Manage Users</h1>

      {editingUser ? (
        <form onSubmit={handleUpdate} className="mb-6 bg-gray-100 p-4 rounded">
          <h2 className="text-xl mb-2">Edit User: {editingUser.firstName}</h2>
          <input
            type="text"
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="border p-2 mb-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="border p-2 mb-2 w-full"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 mb-2 w-full"
            required
          />
          <input
            type="password"
            placeholder="Password (leave blank to keep unchanged)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2 mb-2 w-full"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="border p-2 mb-2 w-full"
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          <input
            type="text"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="border p-2 mb-2 w-full"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">{user.id}</td>
              <td className="border p-2">{user.firstName} {user.lastName}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => editUser(user)}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
