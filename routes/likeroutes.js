const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

// Toggle like
router.post("/:id/like", async (req, res) => {
  const { userId } = req.body;
  const blogId = req.params.id;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // If user already liked → remove like
    if (blog.likes.includes(userId)) {
      const index = blog.likes.indexOf(userId);
      blog.likes.splice(index, 1);
      //blog.likes.pull(userId);
    } else {
      // Add like, remove dislike
      blog.likes.push(userId);
      const index = blog.likes.indexOf(userId);
      blog.likes.splice(index, 1);
      //blog.dislikes.pull(userId);
    }

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Could not update like" });
  }
});

// Toggle dislike
router.post("/:id/dislike", async (req, res) => {
  const { userId } = req.body;
  const blogId = req.params.id;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.dislikes.includes(userId)) {
      blog.dislikes.pull(userId);
    } else {
      blog.dislikes.push(userId);
      blog.likes.pull(userId);
    }

    await blog.save();
    res.json({ dislikes: blog.dislikes.length });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Could not update dislike" });
  }
});

module.exports = router;
