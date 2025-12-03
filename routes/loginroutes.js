const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/", async (req, res) => {
    const { user_name, user_password } = req.body;

    if (!user_name || !user_password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ user_name });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Compare provided password with stored hashed password
        const isPasswordCorrect = await bcrypt.compare(user_password, user.user_password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                user_name: user.user_name
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Send response
        res.status(200).json({
            message: "Login successful",
            user: {
                user_id: user._id,
                user_email: user.user_email,
                user_name: user.user_name,
                user_key: user.user_key,
                role: user.role
            },
            token,
            refreshToken
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Something went wrong during login" });
    }
});

module.exports = router;
