import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  player1: { type: String, required: true },
  player2: { type: String, required: true },
  grid: { type: [[String]], required: true },
  winner: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  endedBy: { type: String, required: true }
});

const Match = mongoose.model("Match", matchSchema);
export default Match;
