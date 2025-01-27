const connectDB = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Connect to Database
connectDB();



app.use(cors({
  origin: true,
  credentials:true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
// cors(corsOptionsDelegate)

app.use(express.json());
// Middleware for JSON Parsing
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routers/auth.js'));
app.use('/api/notes', require('./routers/notes.js'));

// Health Check
app.get('/', (req, res) => {
    res.json("API is running");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


module.exports = app;
