const express = require('express');
const { connectDB } = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

console.log('Starting server...');

const app = express();

// Connect to Database
console.log('Connecting to database...');
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parses incoming JSON data

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API available at: http://localhost:${PORT}/api/test`);
});