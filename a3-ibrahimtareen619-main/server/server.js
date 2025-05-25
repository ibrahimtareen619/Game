import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import http from 'http';
import authRoutes from './routes/auth.js';
import User from './models/user.js';
import historyRoutes from './routes/hsitory.js';
import Match from './models/Match.js';
import leaderboardRoutes from './routes/leaderboard.js';

dotenv.config({ path: './.env' });

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(' MongoDB Connection Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => {
  res.send('Server is running...');
});

let waitingPlayers = [];
const cancelledUsers = new Set();
const games = {};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('find_match', (userData) => {
    if (cancelledUsers.has(userData.username)) {
      cancelledUsers.delete(userData.username);
    }

    waitingPlayers = waitingPlayers.filter(
      (p) => p.userData.username !== userData.username
    );

    waitingPlayers.push({ socket, userData });

    if (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift();
      const player2 = waitingPlayers.shift();

      if (
        cancelledUsers.has(player1.userData.username) ||
        cancelledUsers.has(player2.userData.username)
      ) {
        if (!cancelledUsers.has(player1.userData.username)) waitingPlayers.unshift(player1);
        if (!cancelledUsers.has(player2.userData.username)) waitingPlayers.unshift(player2);
        return;
      }

      const gameId = `game-${Date.now()}`;
      const room = gameId;

      player1.socket.join(room);
      player2.socket.join(room);

      const colors = ['red', 'blue'];
      const firstGoesFirst = Math.random() < 0.5;

      const player1Color = colors[firstGoesFirst ? 0 : 1];
      const player2Color = colors[firstGoesFirst ? 1 : 0];

      games[gameId] = {
        grid: Array(5).fill(null).map(() => Array(5).fill("")),
        turn: player1Color,
        players: [
          {
            username: player1.userData.username,
            profile_picture_url: player1.userData.profile_picture_url,
            color: player1Color
          },
          {
            username: player2.userData.username,
            profile_picture_url: player2.userData.profile_picture_url,
            color: player2Color
          }
        ]
      };

      io.to(room).emit('start_game', {
        gameId,
        players: games[gameId].players
      });
    }
  });

  socket.on('cancel_match', ({ username }) => {
    cancelledUsers.add(username);
    waitingPlayers = waitingPlayers.filter(p => p.userData.username !== username);
  });

  socket.on("join_game", ({ gameId, username }) => {
    socket.join(gameId);
    const game = games[gameId];
    if (!game) return;

    io.to(gameId).emit("game_state", {
      grid: game.grid,
      turn: game.turn,
      players: game.players
    });
  });

  socket.on("make_move", ({ gameId, row, col, color }) => {
    const game = games[gameId];
    if (!game) return;
    if (game.grid[row][col] !== "" || game.turn !== color) return;

    game.grid[row][col] = color;
    game.turn = color === 'red' ? 'blue' : 'red';

    io.to(gameId).emit("move_made", {
      grid: game.grid,
      turn: game.turn
    });

    const winnerColor = checkWinner(game.grid);
    if (winnerColor) {
      if (winnerColor === 'draw') {
        endGame(gameId, "draw");
        delete games[gameId];
      } else {
        const winnerUsername = getUsernameByColor(game, winnerColor);
        endGame(gameId, winnerUsername);
      }
    }
  });

  socket.on("forfeit_game", ({ room, username }) => {
    const game = games[room];
    if (!game) return;

    const winner = game.players.find(p => p.username !== username);
    if (winner) {
      endGame(room, winner.username);
    }
  });

  socket.on('disconnect', () => {
    waitingPlayers = waitingPlayers.filter(p => p.socket.id !== socket.id);
  });
});

function getUsernameByColor(game, color) {
  return game.players.find(p => p.color === color)?.username;
}

function checkWinner(grid) {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const color = grid[row][col];
      if (!color) continue;
      for (let [dx, dy] of directions) {
        let count = 1,
          r = row + dx,
          c = col + dy;
        while (r >= 0 && r < 5 && c >= 0 && c < 5 && grid[r][c] === color) {
          count++;
          if (count === 5) return color;
          r += dx;
          c += dy;
        }
      }
    }
  }

  if (grid.some(row => row.includes(""))) return null;

  const copy = grid.map(r => [...r]);
  const areas = maxAreaOfIsland(copy);
  return areas.red > areas.blue ? 'red' : areas.blue > areas.red ? 'blue' : 'draw';
}

async function updateCoinsAndStats(game, winnerUsername) {
  const isDraw = winnerUsername === "draw";

  for (const player of game.players) {
    try {
      const user = await User.findOne({ username: player.username });
      if (!user) continue;

      const isWinner = player.username === winnerUsername;
      const coinsChange = isDraw ? 0 : isWinner ? 200 : -200;
      const newCoins = Math.max(user.coins + coinsChange, 0);

      const statUpdate = isDraw
        ? { draw: user.draw + 1 }
        : isWinner
        ? { win: user.win + 1 }
        : { loss: user.loss + 1 };

      await User.updateOne(
        { username: player.username },
        {
          $set: {
            coins: newCoins,
            ...statUpdate
          }
        }
      );
    } catch (err) {
      console.error(`Failed to update stats for ${player.username}`, err);
    }
  }
}

async function endGame(gameId, winnerUsername, endedBy = "win") {
  const game = games[gameId];
  if (!game) return;

  const isDraw = winnerUsername === "draw";
  io.to(gameId).emit("game_end", { winner: isDraw ? "draw" : winnerUsername });

  await updateCoinsAndStats(game, winnerUsername);

  try {
    const match = new Match({
      gameId,
      player1: game.players[0].username,
      player2: game.players[1].username,
      grid: game.grid,
      winner: isDraw ? "null" : winnerUsername,
      endedBy: isDraw ? "draw" : endedBy
    });
    await match.save();
  } catch (err) {
    console.error("Failed to save match history", err);
  }

  delete games[gameId];
}

export function maxAreaOfIsland(grid) {
  const rows = grid.length,
    cols = grid[0].length;
  const colorMax = { red: 0, blue: 0 };

  function dfs(r, c, color, counter) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== color) return;
    grid[r][c] = null;
    counter.value++;
    dfs(r + 1, c, color, counter);
    dfs(r - 1, c, color, counter);
    dfs(r, c + 1, color, counter);
    dfs(r, c - 1, color, counter);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = grid[r][c];
      if (color === 'red' || color === 'blue') {
        const counter = { value: 0 };
        dfs(r, c, color, counter);
        if (counter.value > colorMax[color]) {
          colorMax[color] = counter.value;
        }
      }
    }
  }

  return colorMax;
}

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
