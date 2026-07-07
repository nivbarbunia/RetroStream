const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema({
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    profile:   { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },
    content:   { type: mongoose.Schema.Types.ObjectId, ref: "Content", required: true },
    progress:  { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    watchedAt: { type: Date, default: Date.now }
});

watchHistorySchema.index({ profile: 1, content: 1 }, { unique: true });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);