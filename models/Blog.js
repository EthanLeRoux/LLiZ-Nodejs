const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: null },

    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }]
});

module.exports = mongoose.model("Blog", BlogSchema);
