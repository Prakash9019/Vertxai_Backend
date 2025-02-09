const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./db");
const User = require("./models/user");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID='673542565874-ssffgagnlcbstnstkkg4q8lg27dbo9l3.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);
const jwt = require("jsonwebtoken");
const path = require("path");
dotenv.config();
// const JWT_SECRET = "surya_secret"; 
connectDB(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 5000;

//  app.use(cors({
//   origin: true,
//   credentials:true, 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// }));

app.use((req, res, next) => {
  // res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups"); // ✅ Allow popups & authentication redirects
  // res.setHeader("Cross-Origin-Embedder-Policy", "require-corp"); 
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Access-Control-Allow-Origin", "*"); // ✅ Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(cors({
  origin: true, // ✅ Allow frontend origins
  credentials: true, // ✅ Required for authentication
  methods: ["GET", "POST", "PUT", "DELETE"],
}));





app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);




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
// const MongoStore = require("connect-mongo");

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "default_secret",
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: 'mongodb+srv://plsprakash2003:Surya_2003@cluster0.bpe9m.mongodb.net/Cluster0?retryWrites=true&w=majority' }),
//     cookie: {
//       secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
//       httpOnly: true, // Prevent client-side access to cookies
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//     },
//   })
// );


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

app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "https://vertxai.vercel.app/signup1"  }), 
  async (req, res) => {
    // ✅ Extract user data
    if (req.user) {
      const userData = {
        googleId: req.user.googleId,
        name: req.user.username,
        email: req.user.email,
        profilePic: req.user.profilePic,
      };
      const { googleId, email, name, profilePic } = userData;
      console.log(userData);
      let user = await User.findOne({ googleId: googleId });
      console.log(user);
      if (!user) {
        user = new User({
          googleId,
          email,
          name,
          profilePic,
        });
        await user.save();
        console.log(user);
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
      const token = jwt.sign({ email , verificationCode }, JWT_SECRET);
     res.json({ success: true, token });
     
    } else {
      res.redirect("https://vertxai.vercel.app/signup1");
    }
  }
);


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
      res.redirect("https://vertxai.vercel.app");
  })
})

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routers/auth.js"));
app.use("/api/posts", require("./routers/post.js"));
app.use("/api/notes", require("./routers/notes.js"));


app.get("/", (req, res) => {
  res.json("API is running successfully");
});
const JWT_SECRET= 'surya_secret';
app.post("/api/google-login", async (req, res) => {
  const { token } = req.body;
  console.log(token);
  try {
    // 01. Verify the token using Google API
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    let user = await User.findOne({ googleId: sub });
    if (!user) {
      user = new User({
        googleId: sub,
        email,
        name,
        profilePic : picture,
      });
      await user.save();
      console.log(user);
    }
     const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
     const token1 = jwt.sign({ email, verificationCode }, JWT_SECRET);
     console.log(token1);
     res.status(200).json({ success: true, token : token1  });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;
