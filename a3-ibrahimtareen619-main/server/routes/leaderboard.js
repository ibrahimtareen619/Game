import express from "express";
import User from "../models/user.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? { username: { $regex: search, $options: "i" } }
      : {};

    const topPlayers = await User.find(filter)
      .sort({ coins: -1 })
      .limit(10)
      .select("username coins profile_picture_url win loss draw");

    res.json(topPlayers);
  } catch (err) {
    console.error(" Failed to fetch leaderboard:", err);
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
});

export default router;
