// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// GET comments for a specific blog
router.get('/:blogId', async (req, res) => {
    try {
        const comments = await Comment.find({ blogId: req.params.blogId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// GET all comments for a blog
router.get('/:blogId', async (req, res) => {
    try {
        const comments = await Comment.find({ blogId: req.params.blogId })
                                      .sort({ createdAt: 1 }); // oldest first
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});


// POST a new comment
router.post('/', async (req, res) => {
    const { blogId, author, authorId, content, parentId } = req.body;

    if (!blogId || !author || !content) {
        return res.status(400).json({ error: 'Blog ID, author, and content are required' });
    }

    try {
        const newComment = new Comment({ blogId, author, authorId, content, parentId });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});

// DELETE a comment (optional, admin only)
router.delete('/:commentId', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.commentId);
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;
