//DATA STRUCTURE
const mongoose = require("mongoose");

// DEFINE REVIEW STRUCTURE — one profile can review a content item once (upsert-style edits after that)
const reviewSchema = new mongoose.Schema(
    {
        profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
        content: { type: mongoose.Schema.Types.ObjectId, ref: "Content", required: true },
        rating:  { type: Number, required: true, min: 1, max: 5 },
        text:    { type: String, trim: true, default: "" }
    },
    { timestamps: true }
);

reviewSchema.index({ profile: 1, content: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
