const connectDB = require('./db');
const express = require('express');

const app = express();
const PORT = 5000;

// Connect to the database
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/auth', require('./routers/auth.js'));
app.use('/api/notes', require('./routers/notes'));

// Test route
app.get('/', (req, res) => {
    res.json("Hello, this is VertxAI!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`VertxAI listening at http://localhost:${PORT}`);
});
