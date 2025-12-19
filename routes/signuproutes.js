const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

router.post("/", async (req, res) => {
    const { user_name, user_email, user_password } = req.body;

    if (!user_name || !user_email || !user_password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const saltRounds = 12;
    const hashedPassword = user_password; //no more hashing, as theres a hashing presave for user schema
    const role = "user";
    const userKey = "uh9hbidjewcivuwgevdibqjwk";

    try {
        // Check if username already exists
        const usernameExists = await User.findOne({ user_name });
        if (usernameExists) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Check if email already exists
        const emailExists = await User.findOne({ user_email });
        if (emailExists) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Create new user
        const newUser = new User({
            user_name,
            user_email,
            user_password: hashedPassword,
            user_key: userKey,
            role
        });

        await newUser.save();

        res.status(201).json({
            user_name: newUser.user_name,
            user_email: newUser.user_email,
            user_password: hashedPassword,
            user_key: newUser.user_key,
            role: newUser.role
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
