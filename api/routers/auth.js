const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const router = express.Router();
const JWT_SECRET = "surya_secret"; // Ensure this is an environment variable for security



// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'otp.vertx@gmail.com', // Your email
    pass: 'cfbb fnun rwtt wctv', // Gmail App Password
  },
});

// Generate a token with email and code
const generateVerificationToken = (email, code) => {
  return jwt.sign({ email, code }, JWT_SECRET); // Token expires in 5 minutes
};


// **1. Register User and Send Verification Email**
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("dob").isISO8601().toDate().withMessage("Enter a valid date in YYYY-MM-DD format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, dob,name } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
      const token = jwt.sign({ email, verificationCode }, JWT_SECRET);
      

      // Save the user with unverified status
      const user = new User({ name , email, dob, isVerified: false });
      await user.save();

      // Send verification email
      await transporter.sendMail({
        to: email,
        subject: "Your Verification Code",
        html: `<p>Your verification code is <strong>${verificationCode}</strong>. It will expire in 5 minutes.</p>`,
      });

      res.status(200).json({ message: "Verification token sent to email.", token });
    } catch (error) {
      console.error("Error during registration:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// **2. Verify Email**
router.post(
  "/verify",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("code").isLength({ min: 6, max: 6 }).withMessage("Invalid verification code"),
  ],
  async (req, res) => {
    const { token, code } = req.body;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { email, code: storedCode } = decoded;
      if (storedCode !== code) {
        return res.status(400).json({ message: "Invalid verification code." });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "User is already verified." });
      }

      // Mark user as verified
      user.isVerified = true;
      await user.save();

      res.status(200).json({ message: "User verified successfully. You can now set a password." });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Verification token has expired. Please register again." });
      }

      console.error("Error during verification:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// **3. Set Password**
router.post(
  "/set-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, JWT_SECRET);
    const { email, code: storedCode } = decoded;
    try {
      const user = await User.findOne({ email });
      if (!user || !user.isVerified) {
        return res.status(400).json({ message: "Invalid or unverified email." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password set successfully." });
    } catch (error) {
      res.status(500).json({ error: "Server error." });
    }
  }
);

// **4. Update Profile**
router.post("/profile", async (req, res) => {

  const { token, profilePic } = req.body;
  const decoded = jwt.verify(token, JWT_SECRET);
  const { email, code: storedCode } = decoded;
   console.log(req.body);
  try {
      const user = await User.findOneAndUpdate(
          { email },
          { profilePic },
          { new: true }
      );
       console.log(user);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});

router.post("/get-profile", async (req, res) => {
  const { email } = req.body;

  try {
    // const decoded = jwt.verify(token, JWT_SECRET);
    // const { email } = decoded;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: {
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// **5. Set Username**
router.post("/set-username", [
  body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters")
], async (req, res) => {
  const { token, username } = req.body;
  const decoded = jwt.verify(token, JWT_SECRET);
  const { email, code: storedCode } = decoded;
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
      res.status(200).json({ message: "Username set successfully", user  });
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});

// **6. Login**
router.post(
'/login',
[
  body('identifier').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
],
async (req, res) => {
 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const email = user.email;
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.status(200).json({ message: 'Login successful', token,email });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
);

router.post('/checkUser', async (req, res) => {
const { identifier } = req.body;
console.log(identifier);
if (!identifier) {
  return res.status(400).json({ message: 'Email is required' });
}

try {
  // const user = await User.findOne({ email });
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });
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


router.post("/verify-account", async (req, res) => {
  const { identifier } = req.body; // identifier can be email or username

  if (!identifier) {
    return res.status(400).json({ message: "Email or username is required" });
  }

  try {
    // Check if the user exists (search by email or username)
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a token for email verification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
    const token = generateVerificationToken(user.email, verificationCode);
    

    // Send the verification link to the user's email
    await transporter.sendMail({
      to: user.email,
      subject: "Your Verification Code",
      html: `<p>Your verification code is <strong>${verificationCode}</strong>. It will expire in 5 minutes.</p>`,
    });


    res.status(200).json({ message: "Verification link sent to email.",status: true,token });
  } catch (error) {
    console.error("Error during account verification:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/verify-new",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("code").isLength({ min: 6, max: 6 }).withMessage("Invalid verification code"),
  ],
  async (req, res) => {
    const { token, code } = req.body;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { email, code: storedCode } = decoded;
      if (storedCode !== code) {
        return res.status(400).json({ message: "Invalid verification code." });
      }

      res.status(200).json({ message: "User verified successfully. You can now set a password.",status:true });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Verification token has expired. Please register again." });
      }

      console.error("Error during verification:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// **Resend OTP API**
router.post(
  "/resend-otp",
  [body("email").isEmail().withMessage("Enter a valid email")],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a new OTP and verification token
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
      const token = generateVerificationToken(email, verificationCode);

      // Update the user record with the new token and code
      user.verificationToken = token;
      user.verificationTokenExpiry = Date.now() + 5 * 60 * 1000; // Expiry set to 5 minutes from now
      await user.save();

      // Send the verification email
      await transporter.sendMail({
        to: email,
        subject: "Resend Verification Code",
        html: `<p>Your new verification code is <strong>${verificationCode}</strong>. It will expire in 5 minutes.</p>`,
      });

      res.status(200).json({ message: "Verification code resent to email.", token });
    } catch (error) {
      console.error("Error during OTP resend:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.post("/get-user", async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const users = await User.findOne({ email }); // Fetch all users from DB
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});



module.exports = router;


