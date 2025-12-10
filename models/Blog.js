const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: null },
    likes: { type: [mongoose.Schema.Types.ObjectId],ref: "User", default: [],required: true  },
    dislikes: { type: [mongoose.Schema.Types.ObjectId],ref: "User", default: [],required: true  },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }]
});

module.exports = mongoose.model("Blog", BlogSchema);
