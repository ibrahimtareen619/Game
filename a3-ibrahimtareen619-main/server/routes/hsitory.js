import express from "express";
import Match from "../models/Match.js";

const router = express.Router();

router.get("/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const matches = await Match.find({
      $or: [{ player1: username }, { player2: username }]
    }).sort({ timestamp: -1 });

    res.json(matches);
  } catch (err) {
    console.error(" Error fetching match history:", err);
    res.status(500).json({ message: "Failed to load history" });
  }
});

export default router;
