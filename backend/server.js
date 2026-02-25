const express = require('express');
const { connectDB } = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
 connectDB();// Connect to Databas

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parses incoming JSON data

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));