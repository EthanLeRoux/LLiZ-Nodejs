const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const Tag = require("../models/Tag");
const authenticateToken = require("../middleware/auth");

// GET all blogs
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find().populate("tags");

        if (blogs.length === 0) {
            return res.status(404).json({ error: "No blogs were found :(" });
        }

        res.json(blogs);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Something went wrong with fetching blogs" });
    }
});

// GET blog by id
router.get("/:id", async (req, res) => {
    try {
        const blogId = req.params.id;

        if (!blogId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid blog ID" });
        }

        const blog = await Blog.findById(blogId).populate("tags");

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        res.json({
            title: blog.title,
            author: blog.author,
            content: blog.content,
            tags: blog.tags.map(t => t.tag_name),
            appId: process.env.CUSDIS_APP_ID
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error: Unable to fetch blog" });
    }
});

// POST create blog
router.post("/", authenticateToken, async (req, res) => {
    const { title, author, content, tags, authorId } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
    }

    try {
        let tagIds = [];

        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                let tag = await Tag.findOne({ tag_name: tagName });

                if (!tag) {
                    console.warn(`Tag "${tagName}" not found. Skipping.`);
                    continue;
                }

                tagIds.push(tag._id);
            }
        }

        const newBlog = new Blog({
            title,
            author,
            authorId,
            content,
            tags: tagIds
        });

        await newBlog.save();

        res.status(201).json({
            message: "Blog post created successfully",
            blogId: newBlog._id
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Something went wrong during blog submission" });
    }
});

// DELETE blog
router.delete("/:id", async (req, res) => {
    try {
        const blogId = req.params.id;

        if (!blogId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid blog ID" });
        }

        const deleted = await Blog.findByIdAndDelete(blogId);

        if (!deleted) {
            return res.status(404).json({ error: "Blog not found" });
        }

        res.json({ message: "Blog deleted successfully" });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error: Unable to delete the blog" });
    }
});

// UPDATE blog
router.put("/:id", async (req, res) => {
    try {
        const blogId = req.params.id;
        const { title, content } = req.body;

        if (!blogId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid blog ID" });
        }

        const updated = await Blog.findByIdAndUpdate(
            blogId,
            {
                title,
                content,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Blog not found" });
        }

        res.json({ message: "Blog updated successfully" });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error: Unable to update the blog" });
    }
});

module.exports = router;
