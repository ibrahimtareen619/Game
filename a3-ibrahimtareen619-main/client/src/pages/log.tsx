import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/login.css"; // ✅ Use a relative path instead of full Windows path// if you have a CSS file

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        username,
        password,
      });
      sessionStorage.setItem("user", JSON.stringify(res.data));
      navigate("/home");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="auth-container">
      <h1 className="auth-title">Login</h1>
      <form className="auth-form" onSubmit={handleLogin}>
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

        <button type="submit" className="btn btn-primary">
          Log In
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>

      <p className="auth-footer">
        Don’t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </main>
  );
};

export default Login;
