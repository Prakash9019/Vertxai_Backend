const connectDB = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require("express-session");
const User = require("./user.js");
const cookieSession = require("cookie-session");
const passport = require("passport");
require("dotenv").config();

// require("./config/passport"); // Passport Configuration
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
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  })
);
app.use(passport.initialize());
app.use(passport.session());


const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }

      const newUser = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        profilePicture: profile.photos[0].value,
      });

      done(null, newUser);
    }
  )
);

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Google OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/"); // Redirect to your frontend after successful login
  }
);

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    res.redirect("/");
  });
});

app.get("/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user); // Send user details to the frontend
  } else {
    res.status(401).send("Unauthorized");
  }
});



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
