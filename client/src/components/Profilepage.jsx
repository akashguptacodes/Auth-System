// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth(); // logged-in user
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "", // ✅ Added
    image: "",
  });

  // Fetch profile on mount
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/user/getbyid/${user.id}`,
            { withCredentials: true }
          );
          setProfile(res.data);
          setForm({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            email: res.data.email,
            password: "", // ✅ keep blank
            role: res.data.role,
            image: res.data.image,
          });
        } catch (err) {
          console.error(err);
          alert("Failed to fetch profile");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // build update object
      const updateData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: profile.role, // role not editable
        image: form.image,
      };

      // ✅ only add password if not blank
      if (form.password && form.password.trim() !== "") {
        updateData.password = form.password;
      }
console.log(updateData);
console.log(user);


      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/user/${user.id}`,
        updateData,
        { withCredentials: true }
      );

      alert("Profile updated successfully");
      setIsEditing(false);

      // Refresh local profile
      setProfile({ ...profile, ...updateData });

      // reset password input
      setForm({ ...form, password: "" });
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">You must be logged in to view this page.</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl mb-4">My Profile</h1>

      {profile && (
        <div className="bg-gray-100 p-4 rounded space-y-2">
          <p><strong>First Name:</strong> {profile.firstName}</p>
          <p><strong>Last Name:</strong> {profile.lastName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          {/* <p><strong>Image URL:</strong> {profile.image}</p> */}
          {profile.image && (
            <img src={profile.image} alt="Profile" className="w-32 h-32 rounded mt-2" />
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          >
            Edit Profile
          </button>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdate} className="space-y-2">
              <input
                type="text"
                placeholder="First Name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-2 w-full"
                required
              />
              <input
                type="password"
                placeholder="Password (leave blank to keep unchanged)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border p-2 w-full"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="border p-2 w-full"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
