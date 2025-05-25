import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/leaderboard.css";

interface Player {
  username: string;
  coins: number;
  win: number;
  loss: number;
  draw: number;
  profile_picture_url?: string;
}

const Leaderboard: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const fetchLeaderboard = (query = "") => {
    setLoading(true);
    axios
      .get(`http://localhost:8000/api/leaderboard${query ? `?search=${query}` : ""}`)
      .then((res) => {
        setPlayers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load leaderboard", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!user?.username) {
      navigate("/login");
      return;
    }
    fetchLeaderboard();
  }, [navigate, user?.username]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeaderboard(search.trim());
  };

  if (loading) return <p className="leaderboard-loading">Loading leaderboard...</p>;

  return (
    <main className="board-container">
      <h1 className="board-title">🏆 Leaderboard</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by username…"
          className="search-box"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {players.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <table className="board-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Draws</th>
              <th>Coins</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr
                key={player.username}
                className={player.username === user.username ? "current-user" : ""}
              >
                <td>
                  {player.profile_picture_url && (
                    <img
                      src={player.profile_picture_url}
                      alt="avatar"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        marginRight: 8,
                        verticalAlign: "middle",
                      }}
                    />
                  )}
                  {player.username}
                </td>
                <td>{player.win}</td>
                <td>{player.loss}</td>
                <td>{player.draw}</td>
                <td>💰 {player.coins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default Leaderboard;
