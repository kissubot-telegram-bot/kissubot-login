require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const verifyTelegramAuth = require('./verifyTelegramAuth')
const User = require('./models/User')
const profileRoutes = require('./profileRoutes')


const app = express()
app.use(cors())
app.use(bodyParser.json())

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err))

app.post('/auth', async (req, res) => {
  const userData = req.body
  const isValid = verifyTelegramAuth(userData, process.env.BOT_TOKEN)
  if (!isValid) return res.status(403).json({ message: 'Unauthorized' })

  try {
    const user = await User.findOneAndUpdate(
      { id: userData.id }
      userData
      { new: true, upsert: true }
    );
    res.json({ message: 'Login successful', user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
});
app.use('/api/user', profileRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
