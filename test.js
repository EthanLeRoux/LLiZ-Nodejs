const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User"); // adjust path if needed
const connectDB = require("./mongodb");

// Change these:
const usernameToReset = "necro"; // the user_name of the account
const newPassword = "123456"; // the new plain-text password

async function resetPassword() {
  try {
    await mongoose.connect("mongodb+srv://ethanleroux119_db_user:PAeO3IZFcpzabAkE@cluster0.vk4qche.mongodb.net/lliz_dev");

    const user = await User.findOne({ user_name: usernameToReset });
    if (!user) {
      console.log("User not found");
      process.exit(0);
    }

    user.user_password = newPassword;
    await user.save();

    console.log(`Password for ${usernameToReset} has been reset to: ${newPassword}`);
    process.exit(0);
  } catch (err) {
    console.error("Error resetting password:", err);
    process.exit(1);
  }
}

resetPassword();
