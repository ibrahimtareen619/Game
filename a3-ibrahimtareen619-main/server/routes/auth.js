import express from 'express';
import User from '../models/user.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password, profile_picture_url } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({
      username,
      password,
      profile_picture_url,
      coins: 1000,
      win: 0,
      loss: 0,
      draw: 0
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      profile_picture_url: user.profile_picture_url,
      coins: user.coins
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      id: user._id,
      username: user.username,
      profile_picture_url: user.profile_picture_url,
      coins: user.coins
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

router.get("/me/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

router.put("/update/:username", async (req, res) => {
  try {
    const { password, profile_picture_url } = req.body;

    const update = {};
    if (password) update.password = password;
    if (profile_picture_url) update.profile_picture_url = profile_picture_url;

    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: update },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
