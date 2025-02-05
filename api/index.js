const connectDB = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require("express-session");
const User = require("./models/user.js");
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
// app.use("/api/post",require(""))

// Health Check
app.get('/', (req, res) => {
    res.json("API is running");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


module.exports = app;






// const connectDB = require("./db");
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const passport = require("passport");
// const cookieSession = require("cookie-session");
// require("dotenv").config();

// const app = express();
// connectDB();

// // CORS Setup
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173", // Change to your frontend URL
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Cookie-based session
// app.use(
//   cookieSession({
//     name: "session",
//     keys: [process.env.SESSION_SECRET],
//     maxAge: 24 * 60 * 60 * 1000, // 1 day
//   })
// );

// // Passport Initialization
// app.use(passport.initialize());
// app.use(passport.session());
// const User = require("./user.js")
// // Google OAuth Setup
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL, // Use from .env
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ googleId: profile.id });
//         if (!user) {
//           user = await User.create({
//             googleId: profile.id,
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             profilePicture: profile.photos[0].value,
//           });
//         }
//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );


// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   const user = await User.findById(id);
//   done(null, user);
// });

// // Authentication Routes
// app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// app.get(
//   "/api/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     res.redirect(process.env.FRONTEND_URL || "/");
//   }
// );

// app.get("/api/auth/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) console.error(err);
//     res.redirect(process.env.FRONTEND_URL || "/");
//   });
// });

// app.get("/api/auth/user", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.json(req.user);
//   } else {
//     res.status(401).send("Unauthorized");
//   }
// });

// // API Routes
// app.use("/api/notes", require("./routers/notes.js"));

// // Health Check
// app.get("/api", (req, res) => {
//   res.json("API is running");
// });

// // Export Serverless Function
// module.exports = app;
