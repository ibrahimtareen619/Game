import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import "C:/Users/Ibrahim/OneDrive/Documents/GitHub/a3-ibrahimtareen619/design/css/gameplay.css"; 

const socket: Socket = io("http://localhost:8000");

const GameScreen: React.FC = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [grid, setGrid] = useState<string[][]>(
    Array(5).fill(null).map(() => Array(5).fill(""))
  );
  const [turn, setTurn] = useState<string>("");
  const [playerColor, setPlayerColor] = useState<string>("");
  const [opponent, setOpponent] = useState<any>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user?.username || !gameId) {
      navigate("/login");
      return;
    }
    
    socket.emit("join_game", { gameId, username: user.username });

    socket.on("game_state", ({ grid, turn, players }) => {
      setGrid(grid);
      setTurn(turn);
      const me = players.find((p: any) => p.username === user.username);
      const opp = players.find((p: any) => p.username !== user.username);
      setPlayerColor(me.color);
      setOpponent(opp);
    });

    socket.on("move_made", ({ grid, turn }) => {
      setGrid(grid);
      setTurn(turn);
    });

    socket.on("game_end", ({ winner }) => {
      setWinner(winner);
    });

    return () => {
      socket.off("game_state");
      socket.off("move_made");
      socket.off("game_end");
    };
  }, [gameId, navigate, user.username]);

  const handleCellClick = (row: number, col: number) => {
    if (winner || turn !== playerColor || grid[row][col] !== "") return;
    socket.emit("make_move", { gameId, row, col, color: playerColor });
  };

  const forfeit = () => {
    socket.emit("forfeit_game", { room: gameId, username: user.username });
    setWinner(opponent.username);
  };

  const playAgain = () => {
    navigate("/newgame/waiting");
  };

  return (
    <main className="game-container">
      <div className="players-header">
        <div className="player-box">
          <img src={user.profile_picture_url} alt="You" className="avatar" />
          <span>{user.username}</span>
        </div>
        <span className="vs">VS</span>
        <div className="player-box">
          <img src={opponent?.profile_picture_url} alt="Opponent" className="avatar" />
          <span>{opponent?.username || "Waiting..."}</span>
        </div>
      </div>

      <div className="grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="cell"
              style={{ backgroundColor: cell || "#ddd", cursor: cell === "" && turn === playerColor && !winner ? "pointer" : "default" }}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          ))
        )}
      </div>

      <div className="status-area">
        {!winner ? (
          <>
            <p>
              Status: <strong>{turn === playerColor ? "Your Turn" : "Opponent's Turn"}</strong>
            </p>
            <button className="btn btn-secondary" onClick={forfeit}>
              Forfeit
            </button>
          </>
        ) : (
          <>
            <p className={`result-text ${winner === user.username ? "win" : winner === "draw" ? "draw" : "lose"}`}>
              {winner === user.username
                ? "🎉 You Won! (+200 coins)"
                : winner === "draw"
                ? "🤝 It's a Draw!"
                : "😞 You Lost (-200 coins)"}
            </p>
            <button className="btn btn-primary" onClick={playAgain}>
              🔁 Play Again
            </button>
            <button className="btn btn-home" onClick={() => navigate("/home")}>
              🏠 Home
            </button>
          </>
        )}
      </div>
    </main>
  );
};

export default GameScreen;
