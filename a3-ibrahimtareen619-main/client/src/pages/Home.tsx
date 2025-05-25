import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import  "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/home.css"; 
interface User {
  id: string;
  username: string;
  profile_picture_url: string;
  coins: number;
}

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!storedUser.username) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:8000/api/auth/me/${storedUser.username}`)
      .then((res) => {
        setUser(res.data);
        sessionStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => {
        sessionStorage.removeItem("user");
        navigate("/login");
      });
  }, []);

  if (!user) return null;

  return (
    <main className="home-container">
      <h1 className="home-title">Welcome, {user.username}!</h1>
      {user.profile_picture_url && (
        <img
          src={user.profile_picture_url}
          alt="Profile"
          className="profile-pic"
        />
      )}
      <p className="home-coins">
        Coins: <strong>{user.coins}</strong>
      </p>

      <div className="home-buttons">
        <Link to="/newgame/waiting" className="btn btn-primary">
          Play Game
        </Link>
        <Link to="/leaderboard" className="btn btn-secondary">
          Leaderboard
        </Link>
        <Link to="/history" className="btn btn-secondary">
          History
        </Link>
      </div>
    </main>
  );
};

export default Home;
