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
    origin: "*"
}));

// Middleware for JSON Parsing
app.use(express.json());
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
