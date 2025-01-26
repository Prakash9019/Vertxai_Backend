const connectDB = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Connect to Database
connectDB();





var allowlist = ['http://localhost:5173', 'https://www.govertx.com']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}



app.use(cors(corsOptionsDelegate));

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
