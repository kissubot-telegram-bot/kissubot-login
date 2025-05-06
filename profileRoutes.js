const axios = require('axios');
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;

async function notifyMatch(userA, userB) {
  const message = `You matched with @${userB.username || 'someone'}! Tap to chat: https://t.me/${userB.username}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: userA.telegramId,
      text: message
    });
  } catch (err) {
    console.error('Failed to notify:', err.message);
  }
}



const express = require('express');
const router = express.Router();
const User = require('../models/UserProfile');

// Register or update user
router.post('/register', async (req, res) => {
  const data = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { telegramId: data.telegramId },
      data,
      { upsert: true, new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile by Telegram ID
router.get('/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Discover new profiles
router.get('/discover/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    const alreadySeen = [...user.likedUsers, ...user.matches, user.telegramId];
    const suggestions = await User.find({ telegramId: { $nin: alreadySeen } }).limit(10);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like a user
router.post('/like', async (req, res) => {
  const { fromId, toId } = req.body;
  try {
    const fromUser = await User.findOne({ telegramId: fromId });
    const toUser = await User.findOne({ telegramId: toId });


    if (!fromUser || !toUser) return res.status(404).json({ message: "User(s) not found" });

    // Already liked?
    if (fromUser.likedUsers.includes(toId)) {
      return res.status(400).json({ message: "Already liked" });
    }

    fromUser.likedUsers.push(toId);

    // Check for match
    if (toUser.likedUsers.includes(fromId)) {
      fromUser.matches.push(toId);
      toUser.matches.push(fromId);
      await toUser.save();

      await notifyMatch(fromUser, toUser);
await notifyMatch(toUser, fromUser);

    }

    await fromUser.save();
    res.json({ message: "Liked successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get matches
router.get('/matches/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    const matches = await User.find({ telegramId: { $in: user.matches } });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
