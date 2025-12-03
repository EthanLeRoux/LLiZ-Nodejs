const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    user_email: { type: String, required: true, unique: true },
    user_name: { type: String, required: true, unique: true },
    user_password: { type: String, required: true },
    user_key: { type: String },
    role: { type: String, default: "user" }
});

module.exports = mongoose.model("User", UserSchema);
