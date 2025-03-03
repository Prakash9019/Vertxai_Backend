const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String },
    name: { type: String },
    username: { type: String,default: null },
    email: { type: String, unique: true },
    password: { type: String },
    dob: { type: Date },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: "" },
    verificationTokenExpiry: { type: Date }, // Expiry time for the verification token
    profilePic: { type: String, default: "" },
    profilePicture:{type:String}
  },
  { timestamps: true }
);

// TTL Index for auto-deletion of expired tokens
userSchema.index({ verificationTokenExpiry: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("User", userSchema);
