const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
    tag_name: { type: String, unique: true }
});

module.exports = mongoose.model("Tag", TagSchema);
