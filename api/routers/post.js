const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");

const multer =require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/posts", upload.single("image"), async (req, res) => {
  try {
    const { email, title,description } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const image = req.file ? req.file.buffer.toString("base64") : null;

    const newPost = new Post({ userEmail: email, title,description, image });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
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
