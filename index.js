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
// app.use(cors(
//     {
//         origin:["https://notes-application-front-htzqbfgbg.vercel.app"],
//         methods:["POST","GET"],
//         credentials:true
//     }
// ));
app.use(cors());
app.use(express.json());


app.use('/api/auth',require('./routers/auth.js'));
app.use('/api/notes',require('./routers/notes'));
// app.use('/api/qrcode',require('./routers/qrcode'));

// const UserSchema = new mongoose.Schema({
//     username: String,
//     schoolName: String,
//     qrCode: String, // Store the QR code image URL
//   });
  
//   const UserModel = mongoose.model('User', UserSchema);
  
//   app.use(bodyParser.json());
  

//   app.post('/api/generate-qr', async (req, res) => {
//     try {
//       const { username, schoolName } = req.body;
  
//       // Generate QR code
//       const qrCodeData = `"Username is"+${username} - ${schoolName}`;
//       const qrCodeImage = await qrcode.toDataURL(qrCodeData);
  
//       // Save user data and QR code URL to MongoDB
//       const newUser = new UserModel({
//         username:username,
//         schoolName: schoolName,
//         qrCode: qrCodeImage,
//       });
//       await newUser.save();
  
//       res.status(200).json({ qrCodeImage });
//     } catch (error) {
//       console.error('Error generating QR code:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

//   app.get('/api/scan-qr/:id', async (req, res) => {
//     try {
        
//       const userId = req.params.userId;
//     //   console.log( req.params);
//     // userId
//       // Look up the user profile based on userId
//       const userProfile = await UserModel.findById(userId);
//       if (!userProfile) {
//         return res.status(404).json({ error: 'User profile not found' });
//       }
//       res.status(200).json(userProfile);
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });
  
app.get('/',(req,res)=>{
    res.json("hello");
})


app.listen(PORT, () => {
    console.log(`Todolist listening at http://localhost:${PORT}`);
})
