
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  description : { type: String },
  image: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Store user IDs who liked the post
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Store user IDs who shared the post
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports  = mongoose.model("Post", postSchema);
