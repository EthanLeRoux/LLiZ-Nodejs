// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// GET comments for a specific blog
router.get('/blog/:blogId', async (req, res) => {
    try {
        const comments = await Comment.find({ blogId: req.params.blogId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// GET comment by ID
router.get('/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch comment' });
    }
});


// POST a new comment
router.post('/', async (req, res) => {
    const { blogId, author, authorId, content, parentId } = req.body;

    if (!blogId || !author || !authorId || !content) {
        return res.status(400).json({ error: 'Blog ID, author ID, author, and content are required' });
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

// PUT - Edit a comment's content
router.put('/:commentId', async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.commentId,
            { content },
            { new: true }
        );
        if (!updatedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json(updatedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update comment' });
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
