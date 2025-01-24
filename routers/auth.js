
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
    service: 'gmail',
    auth: {
      user: 'plsprakash2003@gmail.com', // Your email
      pass: 'eegy etgc mxbz jlgl', // Gmail App Password
    },
  });


const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
};

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

    const { email, dob } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Generate 6-digit token and expiry time (5 minutes from now)
      const verificationToken = generateVerificationToken();
      const verificationTokenExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Create and save the user
      const user = new User({ email, dob, verificationToken, verificationTokenExpiry });
      await user.save();

      // Send the verification token to the user's email
      await transporter.sendMail({
        to: email,
        subject: "Your Verification Code",
        html: `<p>Your verification code is <strong>${verificationToken}</strong>. It will expire in 5 minutes.</p>`,
      });

      res.status(200).json({ message: "Verification token sent to email." });
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
    body("email").isEmail().withMessage("Enter a valid email"),
    body("verificationToken").isLength({ min: 6, max: 6 }).withMessage("Invalid verification token"),
  ],
  async (req, res) => {
    const { email, verificationToken } = req.body;

    try {
      const user = await User.findOne({ email, verificationToken });

      if (!user) {
        return res.status(400).json({ message: "Invalid token or email." });
      }

      // Check if the token has expired
      if (user.verificationTokenExpiry < new Date()) {
        return res.status(400).json({ message: "Verification token has expired. Please register again." });
      }

      // Mark user as verified and clear the token
      user.isVerified = true;
      user.verificationToken = "";
      user.verificationTokenExpiry = undefined;
      await user.save();

      res.status(200).json({ message: "User verified successfully. You can now set a password." });
    } catch (error) {
      console.error("Error during verification:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);


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
router.post("/profile", async (req, res) => {
    const { email, profilePic } = req.body;
     console.log(req.body);
    try {
      console.log(email);
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
        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        res.status(200).json({ message: "Username set successfully", user,token });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// **6. Login**
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({
        $or: [{ username }, { email: username }], // Check by username or email
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

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
