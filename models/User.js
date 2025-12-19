const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    user_email: { type: String, required: true, unique: true },
    user_name: { type: String, required: true, unique: true },
    user_password: { type: String, required: true },
    user_key: { type: String },
    role: { type: String, default: "user" }
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('user_password')) return;
  this.user_password = await bcrypt.hash(this.user_password, 10);
});

module.exports = mongoose.model("User", UserSchema);
