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

// app.use(cors({
//     origin: [
//         "https://vertxai-backend.vercel.app", // Production frontend
//         "http://localhost:5173" // Development frontend
//     ],
//     methods: ["POST", "GET", "OPTIONS"],
//     credentials: true // Allow cookies/credentials
// }));

// app.options("*", cors()); // Handle preflight requests
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