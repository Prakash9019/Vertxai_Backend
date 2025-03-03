const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const mongoose = require("mongoose");
const multer =require("multer");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "surya_secret"; // Ensure this is an environment variable for security

const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const authenticateToken = require("../middlewares/authenticateToken");

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

router.post("/posts",authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { text,profilePic } = req.body;
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "Image is required" });
    }
    const imageUrl = req.file.path;
    const { email } = req.user;
      const newPost = new Post({text,imageUrl , userEmail : email ,profilePic});
       console.log(newPost);
      await newPost.save();
      res.status(201).json({ message: "post  updated", newPost });
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});

router.put("/posts/:postId/action", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, action, text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid Post ID" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (action === "like") {
      const index = post.likes.indexOf(userId);
      if (index === -1) {
        post.likes.push(userId); // Like the post
      } else {
        post.likes.splice(index, 1); // Unlike the post
      }
    }

    if (action === "bookmark") {
      const index = post.bookmarks.indexOf(userId);
      if (index === -1) {
        post.bookmarks.push(userId); // Bookmark the post
      } else {
        post.bookmarks.splice(index, 1); // Remove bookmark
      }
    }

    if (action === "comment") {
      post.comments.push({ userId, text, createdAt: new Date() });
    }

    await post.save();
    res.status(200).json({ message: "Action updated", post });

  } catch (error) {
    console.error("Error handling post action:", error);
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
