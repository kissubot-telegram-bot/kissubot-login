const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  age: Number,
  gender: String,
  bio: String,
  interests: [String],
  profilePhoto: String,
  location: {
    lat: Number,
    lon: Number
  },
  likedUsers: [String],
  matches: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', userSchema);
