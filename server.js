require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
// const axios = require('axios');



const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phoneNumber: String,
  hospitalName: String
});
const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) =>  res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/profile.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));
app.get('/api/weather', (req, res) => res.sendFile(path.join(__dirname, 'public', 'data_fatcher.html')));
app.get('/index', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Register
app.post('/register', async (req, res) => {
  const { name, email, password, phoneNumber, hospitalName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      hospitalName
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password, phoneNumber } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.phoneNumber !== phoneNumber) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Profile (protected)
app.get('/profile', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ msg: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(403).json({ msg: 'Invalid token' });
  }
});


// weather data fetch
app.post('/api/weather', async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  try {
    
    const response = await fetch(url);
    const data = await response.json();

    // Use 0 if wind.deg is undefined
    const windDirectionDeg = typeof data.wind?.deg === 'number' ? data.wind.deg : 0;

    // 0–7 encoded wind direction
    const windEncoded = Math.floor(((windDirectionDeg + 22.5) % 360) / 45);

    const formattedData = {
      wind_direction: windEncoded,
      wind_speed: data.wind?.speed ? (data.wind.speed * 3.6).toFixed(1) : null, //  km per hour ma che 
      temperature: data.main?.temp ?? null,
      humidity: data.main?.humidity ?? null,
      visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : null, 
      rainfall: data.rain?.['1h'] ?? 0,
    };
    console.log('Raw weather API data:', JSON.stringify(data, null, 2));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
