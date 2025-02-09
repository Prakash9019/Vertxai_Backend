const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs");
const multer =require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const JWT_SECRET = "surya_secret"; // Ensure this is an environment variable for security

const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Cloudinary folder name
    format: async (req, file) => "png", // Convert to PNG format
    public_id: (req, file) => Date.now(), // Unique filename
  },
});

const upload = multer({ storage });

router.post("/posts", upload.single("image"), async (req, res) => {
  try {
    const { token,text,profilePic } = req.body;
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "Image is required" });
    }
    const imageUrl = req.file.path;
    const decoded = jwt.verify(token, JWT_SECRET);
     const { email, code: storedCode } = decoded;
      const newPost = new Post({text,imageUrl , userEmail : email ,profilePic});
       console.log(newPost);
      await newPost.save();
      res.status(201).json({ message: "post  updated", newPost });
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});

// Get All Posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    // console.log(posts);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Unified Post Interaction Route
router.put("/posts/:id/action", async (req, res) => {
  try {
    const { userId, action, text } = req.body; // action can be "like", "comment", "share", or "bookmark"
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    switch (action) {
      case "like":
        if (post.likes.includes(userId)) {
          post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {
          post.likes.push(userId);
        }
        break;

      case "comment":
        if (!text) return res.status(400).json({ error: "Comment text required" });
        post.comments.push({ user: userId, text });
        break;

      case "share":
        if (!post.shares.includes(userId)) {
          post.shares.push(userId);
        }
        break;

      case "bookmark":
        if (post.bookmarks.includes(userId)) {
          post.bookmarks = post.bookmarks.filter((id) => id.toString() !== userId);
        } else {
          post.bookmarks.push(userId);
        }
        break;

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
