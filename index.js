const connectDB = require('./db');
const express = require('express');
var cors=require('cors');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const qrcode = require('qrcode');
//connectDB();
const app = express();
const PORT=5000;
connectDB();

app.use(cors({
    origin: ["http://localhost:5173", "https://your-frontend-production.com"], // Allow these origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    credentials: true, // Allow cookies and authorization headers
}));

app.options("*", cors()); // Handle preflight requests

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow specific origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow headers
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // Respond to preflight request
    }// lkmkmk
    next();
});


// app.use(cors());
app.use(express.json());


app.use('/api/auth',require('./routers/auth.js'));
app.use('/api/notes',require('./routers/notes'));

  
app.get('/',(req,res)=>{
    res.json("hello");
})


app.listen(PORT, () => {
    console.log(`Vertxai listening at http://localhost:${PORT}`);
})  