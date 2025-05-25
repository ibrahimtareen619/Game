import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/home.css"; 

interface User {
  id: string;
  username: string;
  profile_picture_url: string;
  coins: number;
}

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.username) {
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8000/api/auth/me/${parsedUser.username}`)
      .then((res) => {
        setUser(res.data);
        sessionStorage.setItem("user", JSON.stringify(res.data));
        setLoading(false);
      })
      .catch(() => {
        sessionStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        navigate("/login");
      });
  }, [location]);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    navigate("/"); 
  };

  if (loading || !user) return null;

  return (
    <header className="navbar">
      <Link to="/home" className="nav-logo">🎮 ColorGrid</Link>

      <div className="nav-right">
        <span className="coins">💰 {user.coins}</span>

        <div className="profile-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <img
            src={user.profile_picture_url || "https://via.placeholder.com/35"}
            alt="Profile"
            className="profile-pic"
          />
          <span className="username">{user.username}</span>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => navigate("/update-profile")}>Update Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
