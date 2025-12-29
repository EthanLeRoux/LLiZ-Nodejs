const mongoose = require("mongoose");

const FgtokenSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    resetCode: { type: String, required: true },
    expirationDate: { type: Date, required: true }
});

module.exports = mongoose.model("Fgtoken", FgtokenSchema);