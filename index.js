const connectDB = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Connect to Database
connectDB();

// Middleware for CORS
app.use(cors({
    origin: "https://www.govertx.com", // Allow all origins (or specify a specific origin for security)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  }));
  
  // Handle Preflight Requests Globally
  app.options('*', cors()); // Handle preflight requests for all routes
  
  // Parse JSON Request Bodies
  app.use(express.json());
  
  // Custom Middleware for Logging (Optional, for Debugging)
  app.use((req, res, next) => {
    console.log(`Incoming request from origin: ${req.headers.origin}`);
    next();
  });

// Middleware for JSON Parsing
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routers/auth.js'));
app.use('/api/notes', require('./routers/notes'));

// Health Check
app.get('/', (req, res) => {
    res.json("API is running");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
