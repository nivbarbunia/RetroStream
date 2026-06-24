//DATA STRUCTURE
const mongoose = require("mongoose");

// DEFINE POST STRUCTURE — title, content, author + auto timestamps
const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: String, required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);