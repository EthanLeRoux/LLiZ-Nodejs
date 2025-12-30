const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Fgtoken = require("../models/ForgotEmailToken");

// UPDATE user
router.put("/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { user_email, user_name, user_password } = req.body;

    if (!user_email || !user_name || !user_password) {
        return res.status(400).json({ error: "All fields (email, username, password) are required" });
    }

    try {
        // Check if email or username is already taken by another user
        const emailExists = await User.findOne({ user_email, _id: { $ne: id } });
        if (emailExists) {
            return res.status(409).json({ error: "Email is already taken by another user" });
        }

        const usernameExists = await User.findOne({ user_name, _id: { $ne: id } });
        if (usernameExists) {
            return res.status(409).json({ error: "Username is already taken by another user" });
        }

        // Hash password
        const hashedPassword = user_password;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { user_email, user_name, user_password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            user: {
                user_id: updatedUser._id,
                user_email: updatedUser.user_email,
                user_name: updatedUser.user_name,
                user_key: updatedUser.user_key,
                role: updatedUser.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE user
router.delete("/:id", verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

//Forgot email
router.post("/forgotemail", async (req, res)=>{
  const { email } = req.body;

    try {
        //console.log(req.body);

        // Check if email exists
        const user = await User.findOne({ user_email: email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const tokenResetCode = ()=>{
            let tokenArr = [];
            for(let i = 0; i<4; i++){
                tokenArr.push(Math.floor(Math.random() * 10));
            }
            console.log(tokenArr);
            return tokenArr.join("-");
        }

        const newFtgToken = new Fgtoken({
            userId: user._id,
            resetCode: tokenResetCode(),
            expirationDate: new Date(Date.now() + 15 * 60 * 1000)
        });

        console.log(newFtgToken);
        await newFtgToken.save();


        const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            await transporter.sendMail({
                  from: process.env.EMAIL_USER,
                  to: email,
                  subject: 'Email Reset Link',
                  html: `<p>This is the code to reset your email: ${newFtgToken.resetCode}. This code expires in 15 minutes.</p>`,
                });
        
        res.json({ message: 'Email reset code sent' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/resetemail", async (req, res) => {
  const { resetCode, newEmail, userId } = req.body;

  try {
    const token = await Fgtoken.findOne({ resetCode,userId });
    if (!token) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    if (token.expirationDate < new Date()) {
      return res.status(400).json({ message: "Reset code has expired" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.user_email = newEmail;
    await user.save();

    await Fgtoken.deleteOne({ _id: token._id });

    res.json({ message: "Email successfully updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
