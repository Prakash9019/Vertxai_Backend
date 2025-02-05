const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./db");
const User = require("./models/user");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const dotenv = require("dotenv");

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Middleware Setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Session Configuration (Fixing regenerate issue)
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "default_secret",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }, // Set to true if using HTTPS
//   })
// );

// // ✅ Passport Setup
// app.use(passport.initialize());
// app.use(passport.session());

// // ✅ Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const updatedUser = await User.findOneAndUpdate(
//           { googleId: profile.id },  // Search for user by Google ID
//           {
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             profilePicture: profile.photos[0].value,
//           },
//           { new: true, upsert: true, setDefaultsOnInsert: true } // Create if not exists
//         );

//         return done(null, updatedUser);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );


// // ✅ Serialize and Deserialize User
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // ✅ Google OAuth Routes
// app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     res.redirect(process.env.FRONTEND_URL || "/");
//   }
// );

// app.get("/auth/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) return res.status(500).json({ error: "Logout failed" });
//     req.session.destroy(); // Clear session
//     res.redirect(process.env.FRONTEND_URL || "/");
//   });
// });

// app.get("/auth/user", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.json(req.user);
//   } else {
//     res.status(401).json({ error: "Unauthorized" });
//   }
// });
// const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
      httpOnly: true, // Prevent client-side access to cookies
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);


// setuppassport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new OAuth2Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === "production"
        ? "https://vertxai-backend.vercel.app/auth/google/callback"
        : "http://localhost:5000/auth/google/callback",
      scope:["profile","email"]
  },
  async(accessToken,refreshToken,profile,done)=>{
      try {
          let user = await User.findOne({googleId:profile.id});

          if(!user){
              user = new User({
                  googleId:profile.id,
                  displayName:profile.displayName,
                  email:profile.emails[0].value,
                  image:profile.photos[0].value
              });

              await user.save();
          }

          return done(null,user)
      } catch (error) {
          return done(error,null)
      }
  }
  )
)

passport.serializeUser((user,done)=>{
  done(null,user);
})

passport.deserializeUser((user,done)=>{
  done(null,user);
});

// initial google ouath login
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));

app.get("/auth/google/callback",passport.authenticate("google",{
  successRedirect:"https://vertxai-backend.vercel.app/founder",
  failureRedirect:"https://vertxai-backend.vercel.app/"
}))

app.get("/login/sucess",async(req,res)=>{

  if(req.user){
      res.status(200).json({message:"user Login",user:req.user})
  }else{
      res.status(400).json({message:"Not Authorized"})
  }
})

app.get("/logout",(req,res,next)=>{
  req.logout(function(err){
      if(err){return next(err)}
      res.redirect("https://vertxai-backend.vercel.app/");
  })
})

// ✅ Routes
app.use("/api/auth", require("./routers/auth"));
// app.use("/api/posts", require("./routers/posts"));
app.use("/api/notes", require("./routers/notes"));

// ✅ Health Check
app.get("/", (req, res) => {
  res.json("API is running successfully");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;
