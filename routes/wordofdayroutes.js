const express = require('express');
const router = express.Router();
const WordOfDay = require("../models/WordOfDay");

router.get("/", async (req, res) => {
    try {
        const currDate = new Date();
        const currDateOnly = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());

        const word = await WordOfDay.findOne({ word_date: currDateOnly });

        if (!word) {
            return res.status(404).json({ error: "No words were found" });
        }

        return res.json({
            word: word.word,
            definition: word.definition,
            word_date: word.word_date
        });

    } catch (error) {
        console.error("Error fetching word:", error);
        res.status(500).json({ error: "Failed to fetch word of the day" });
    }
});

module.exports = router;
