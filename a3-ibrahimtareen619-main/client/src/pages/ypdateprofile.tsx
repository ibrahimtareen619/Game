import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import  "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/update-profile.css"; 

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:8000/api/auth/update/${user.username}`,
        {
          password: password || undefined,
          profile_picture_url: profilePic || undefined,
        }
      );

      sessionStorage.setItem("user", JSON.stringify(res.data));
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => navigate("/home"), 2000);
    } catch (err: any) {
      console.error("Update failed", err);
      setMessage("❌ Update failed");
    }
  };

  return (
    <main className="update-container">
      <h1 className="update-title">Update Profile</h1>
      <form className="update-form" onSubmit={handleUpdate}>
        <label htmlFor="password">New Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (optional)"
        />

        <label htmlFor="profilePic">Profile Picture URL</label>
        <input
          id="profilePic"
          type="url"
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
          placeholder="New profile picture URL (optional)"
        />

        <button type="submit" className="btn btn-primary">Save Changes</button>
        {message && <p className="update-message">{message}</p>}
      </form>
    </main>
  );
};

export default UpdateProfile;
