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

// GET all blogs sorted by likes ASCENDING
router.get("/bylikes/asc", async (req, res) => {
    try {
        const blogs = await Blog.find().populate("tags");

        if (blogs.length === 0) {
            return res.status(404).json({ error: "No blogs were found :(" });
        }
        blogs.sort((a, b) => b.likes.length - a.likes.length);

        res.json(blogs);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Something went wrong with fetching blogs" });
    }
});

// GET all blogs sorted by date ASCENDING (oldest first)
router.get("/bydate/asc", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("tags")
      .sort({ createdAt: 1 }); // 1 = oldest first

    res.json(blogs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong fetching blogs" });
  }
});

router.get("/bycomments", async (req, res) => {
  try {
    const blogs = await Blog.aggregate([
      // Join comments
      {
        $lookup: {
          from: "comments",          // name of the Comment collection
          localField: "_id",
          foreignField: "blogId",
          as: "comments"
        }
      },

      // Add comment count
      {
        $addFields: {
          commentCount: { $size: "$comments" }
        }
      },

      // Sort by most comments
      {
        $sort: { commentCount: -1 }
      }
    ]);

    // OPTIONAL: Populate tags after pipeline
    await Blog.populate(blogs, { path: "tags" });

    res.json(blogs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch blogs sorted by comments" });
  }
});

//Filter by tags
router.get("/filter", async (req, res) => {
  try {
    const tagIds = req.query.tags?.split(",") || [];

    const blogs = await Blog.find({
      tags: { $in: tagIds }
    }).populate("tags");

    res.json(blogs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not filter blogs by tags" });
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

        res.json(blog);
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
