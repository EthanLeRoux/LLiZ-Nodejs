const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/refresh-token", (req, res) => {
    const refreshToken = req.cookies?.refreshToken; // Get from cookie

    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token provided" });
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, payload) => {
        if (err) {
            return res.status(403).json({ error: "Invalid refresh token" });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
            { userId: payload.userId, user_name: payload.user_name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ accessToken: newAccessToken });
    });
});

module.exports = router;
