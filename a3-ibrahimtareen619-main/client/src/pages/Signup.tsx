import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/signup.css"; 

const Signup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/auth/signup", {
        username,
        password,
        profile_picture_url: profilePic,
      });
      console.log("Signup success:", res.data);
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <main className="auth-container">
      <h1 className="auth-title">Sign Up</h1>
      <form className="auth-form" onSubmit={handleSignup}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="profilePic">Profile Picture URL (optional)</label>
        <input
          id="profilePic"
          name="profilePic"
          type="url"
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
        />

        <button type="submit" className="btn btn-primary">
          Create Account
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>

      <p className="auth-footer">
        Already have an account? <a href="/login">Log In</a>
      </p>
    </main>
  );
};

export default Signup;
