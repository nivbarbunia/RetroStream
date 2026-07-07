//DATA STRUCTURE
const mongoose = require("mongoose");
//DEFINE CONTENT STRUCTURE
const contentSchema = new mongoose.Schema({
    //REQUIRED
    title:         { type: String, required: true, trim: true },
    year:          { type: Number, required: true },
    type:          { type: String, required: true, enum: ["סדרה", "סרט"] },
    genre:         { type: [String], required: true },
    image:         { type: String, required: true },
    //OPTIONAL
    episodeLength: { type: Number }, //SERIES EXCLUSIVE
    duration:      { type: Number }, //MOVIE EXCLUSIVE
    description:   { type: String, default: "" },
    origin:        [String],
    franchise:     { type: [String] },
    rating:        { type: Number, min: 0, max: 10 },
    videoUrl:      { type: String },
    likedBy:       [{ type: mongoose.Schema.Types.ObjectId, ref: "Profile" }]
}, { timestamps: true });

module.exports = mongoose.model("Content", contentSchema);