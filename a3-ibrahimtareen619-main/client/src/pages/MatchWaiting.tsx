import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/waiting.css";
import "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/matchfound.css";

interface Player {
  username: string;
  profile_picture_url: string;
  color: string;
}

const MatchWaiting: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [isMatched, setIsMatched] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.username) {
      navigate("/login");
      return;
    }

    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !user?.username) return;

    socket.emit("find_match", {
      username: user.username,
      profile_picture_url: user.profile_picture_url
    });

    socket.on("start_game", ({ gameId, players }: any) => {
      if (isCancelled) return;

      setIsMatched(true);
      const opponent = players.find((p: Player) => p.username !== user.username);
      setOpponent(opponent);

      setTimeout(() => {
        navigate(`/newgame/${gameId}`);
      }, 3000);
    });

    return () => {
      socket.off("start_game");
    };
  }, [socket, user?.username, isCancelled, navigate]);

  const cancelMatch = () => {
    setIsCancelled(true);
    socket?.emit("cancel_match", { username: user.username });
    navigate("/home");
  };

  return (
    <main className="waiting-container">
      {!isMatched ? (
        <>
          <h1 className="waiting-title">Waiting for Opponent…</h1>
          <p className="waiting-subtitle">Matchmaking in progress</p>
          <button onClick={cancelMatch} className="btn btn-secondary" id="cancelBtn">
            Cancel
          </button>
        </>
      ) : (
        <>
          <h1 className="found-title">Match Found!</h1>
          {opponent && (
            <div className="opponent-info">
              <img
                src={opponent.profile_picture_url || "https://via.placeholder.com/100"}
                alt="Opponent"
                className="opponent-pic"
              />
              <p className="opponent-name">{opponent.username}</p>
              <p className="found-subtitle">Game is about to start…</p>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default MatchWaiting;
