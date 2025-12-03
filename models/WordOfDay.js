const mongoose = require("mongoose");

const WordOfDaySchema = new mongoose.Schema({
    word: { type: String, required: true },
    definition: { type: String, required: true },
    word_date: { type: Date, required: true }
});

module.exports = mongoose.model("WordOfDay", WordOfDaySchema);
