// const express=require('express');
// const { body, validationResult } = require('express-validator');
// const User=require('../user');
// const router=express.Router();
// const jwt=require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const fetchuser=require('../fetch');
// const jwt_s="surya";

// // user register
// router.post('/user',[
//     body('username').isLength({min:3}),
//     body('email').isLength({min:2}).isEmail(),
//     body('password').isLength({min:3}),
//     body('dob')
// ],async (req,res)=>{
//      const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).send("please try to login with error box...");
//     }
//     try{
//     //check the user email is vaildate or not 
//     const user=await User.findOne({email:req.body.email});
//     if(user){
//       return res.status(400).send("please try to login user error...");
//     }

//     const salt=await bcrypt.genSalt(10);
//     const secPass=await bcrypt.hash(req.body.password,salt);
   
//     // const user=User(req.body);    //this two lines are used to simply check the application with backend
//     // user.save();
//      user=await User.create({
//       username: req.body.username,
//       email:req.body.email,
//       password: secPass,
//       dob: req.body.dob
//     });
//     const data={
//       user:{
//         id:user.id
//       }
//      }
//      const jwtData=jwt.sign(data,jwt_s);
//      res.json({jwtData});
//     }
//     catch(error){
//          console.log(error.message);
//     }
//    // res.json(user);
// });

// //for login
// router.post('/login',[
//   body('email','Enter a Correct Email').isEmail(),
//   body('password','Password cnt blank').exists(),
//   body('dob','Dob cant be blank')
// ],async (req,res)=>{
//   let sucess=false;
//   //check for possible errors 
//    const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   const {email,password,dob}=req.body;
//   try{
//     console.log(email + password + dob);
//   const user=await User.findOne({email});
//   if(!user){
//     return res.status(400).send("please try to login with correct credentials...");
//   }
//   const passwordComp= await bcrypt.compare(password,user.password); //compare the given password with the found password in the database
//   if(!passwordComp){
//     sucess=false;
//     return res.status(400).send("please try to login with correct credentials");
//   }
//   else{
//     const data={
//       user:{
//         id:user.id
//       }
//      }
  
//      const jwtData=jwt.sign(data,jwt_s);
//      sucess=true;
//      res.json({sucess,jwtData});
//   }
   
   

// }
// catch(error){
//   res.status(500).send("some error occured");
// }
// });

// router.post('/checkUser', async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ message: 'Email is required' });
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (user) {
//       return res.status(200).json({ message: 'User exists', user });
//     } else {
//       return res.status(404).json({ message: 'User not found' });
//     }
//   } catch (error) {
//     console.error('Error checking user:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });


// module.exports=router;

const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();
const JWT_SECRET = "surya_secret";

// Configure email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'abagail.bradtke@ethereal.email',
        pass: 'U6TU6nW4BfvAfZkV4F'
    }
});

// **1. Register User**
router.post("/register", [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("dob").notEmpty().withMessage("Date of birth is required")
], async (req, res) => {
  // console.log("eesdsd");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, dob } = req.body;
    console.log(email,dob);
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        console.log(existingUser);
        // const salt=await bcrypt.genSalt(10);
        // const secPass=await bcrypt.hash(req.body.password,salt);
       
        const user=User(req.body);    //this two lines are used to simply check the application with backend
        user.save();
        // const  user=await User.create({
        //   // username: req.body.username,
        //   email:email,
        //   dob: dob,
        // });
        const data={
          user:{
            id:user.id
          }
         }
         console.log(user)
         const jwtData=jwt.sign(data,JWT_SECRET);
         console.log(jwtData);
        // Send verification email
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
        const link = `http://localhost:5000/api/auth/verify/${token}`;
        await transporter.sendMail({
            from: "plsprakash2003@gmail.com",
            to: email,
            subject: "Verify your email",
            html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`
        });

        res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **2. Verify Email**
router.get("/verify/:token", async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("hello");
        const user = await User.findOneAndUpdate(
            { email: decoded.email },
            { isVerified: true },
            { new: true }
        );
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Email verified" });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
});

// **3. Set Password**
router.post("/set-password", [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !user.isVerified) {
            return res.status(400).json({ message: "Invalid or unverified email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password set successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// **4. Update Profile**
router.put("/profile", async (req, res) => {
    const { email, profilePic } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { email },
            { profilePic },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated", user });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// **5. Set Username**
router.post("/set-username", [
    body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters")
], async (req, res) => {
    const { email, username } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const user = await User.findOneAndUpdate(
            { email },
            { username },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Username set successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// **6. Login**
router.post("/login", [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required")
], async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/checkUser', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ message: 'User exists', user });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
