const express = require('express');
const router = express.Router();
const WordOfDay = require("../models/WordOfDay");

router.get("/", async (req, res) => {
  try {
    const currDate = new Date();
    const startOfDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
    const endOfDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + 1);

    const word = await WordOfDay.findOne({
      word_date: { $gte: startOfDay, $lt: endOfDay }
    });

    if (!word) {
      return res.status(404).json({ error: "No word found for today" });
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


router.post('/import', async (req, res) => {
  const { words } = req.body; // 👈 extract words array

  if (!Array.isArray(words)) {
    return res.status(400).json({ error: 'Request body must contain a words array' });
  }

  try {
    const formattedWords = words.map(w => ({
      word: w.word,
      definition: w.definition,
      word_date: new Date(new Date(w.word_date).setHours(0, 0, 0, 0))
    }));

    const result = await WordOfDay.insertMany(formattedWords);

    res.status(201).json({
      message: `${result.length} words imported successfully`,
      words: result
    });
  } catch (err) {
    console.error('Error importing words:', err);
    res.status(500).json({ error: 'Failed to import words' });
  }
});



module.exports = router;
