const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');

// GET /tags - fetch all tags
router.get('/', async (req, res) => {
    try {
        const tags = await Tag.find();
        res.json(tags);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// POST /tags/import - bulk import tags
router.post('/import', async (req, res) => {
    const tags = req.body; // expecting array of { tag_name }

    if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'Request body must be an array of tags' });
    }

    try {
        const result = await Tag.insertMany(tags, { ordered: false }); // skips duplicates
        res.status(201).json({
            message: `${result.length} tags imported successfully`,
            tags: result
        });
    } catch (err) {
        console.error('Error importing tags:', err);
        res.status(500).json({ error: 'Failed to import tags' });
    }
});

module.exports = router;
