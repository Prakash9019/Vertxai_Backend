const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String,default: null },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    dob: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: "" },
    verificationTokenExpiry: { type: Date }, // Expiry time for the verification token
    profilePic: { type: String, default: "" },
  },
  { timestamps: true }
);

// TTL Index for auto-deletion of expired tokens
userSchema.index({ verificationTokenExpiry: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("User", userSchema);
