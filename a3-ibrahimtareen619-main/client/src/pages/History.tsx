import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/history.css";

interface Match {
  gameId: string;
  player1: string;
  player2: string;
  winner: string;
  endedBy: "win" | "forfeit";
  timestamp: string;
}

const History: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.username) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:8000/api/history/${user.username}`)
      .then((res) => {
        setMatches(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load history", err);
        setLoading(false);
      });
  }, [navigate, user?.username]);

  if (loading) return <p className="history-loading">Loading match history...</p>;

  return (
    <main className="history-container">
      <h1 className="history-title">📜 Match History</h1>

      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul className="history-list">
          {matches.map((match) => {
            const opponent = match.player1 === user.username ? match.player2 : match.player1;
            const result =
              match.winner === user.username
                ? "Won"
                : match.winner === opponent
                ? "Lost"
                : "Draw";

            return (
              <li
                key={match.gameId}
                className={`history-item ${result.toLowerCase()}`}
              >
                <strong>Game #{match.gameId}</strong> — Opponent: {opponent} — Result: {result}
                <p className="timestamp">{new Date(match.timestamp).toLocaleString()}</p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
};

export default History;
