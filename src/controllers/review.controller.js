//REQUEST HANDLER
const Review = require("../models/review.model");

// RETURNS ALL REVIEWS FOR A CONTENT ITEM, NEWEST FIRST, WITH PROFILE NAME/IMAGE POPULATED
async function getReviews(req, res) {
    try {
        const reviews = await Review.find({ content: req.params.contentId })
            .populate("profile", "name image")
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// CREATES A REVIEW FOR THE ACTIVE PROFILE ON A CONTENT ITEM
async function createReview(req, res) {
    try {
        const { rating, text } = req.body;
        const review = await Review.create({
            profile: req.session.activeProfileId,
            content: req.params.contentId,
            rating,
            text
        });
        res.status(201).json({ success: true, review });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "כבר קיימת ביקורת שלך לתוכן זה" });
        }
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: "נתוני ביקורת לא תקינים", error: err.message });
        }
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// EDITS THE ACTIVE PROFILE'S OWN REVIEW
async function editReview(req, res) {
    try {
        const review = await Review.findOneAndUpdate(
            { _id: req.params.id, profile: req.session.activeProfileId },
            { rating: req.body.rating, text: req.body.text },
            { returnDocument: "after", runValidators: true }
        );
        if (!review) return res.status(404).json({ success: false, message: "ביקורת לא נמצאה" });
        res.json({ success: true, review });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: "נתוני ביקורת לא תקינים", error: err.message });
        }
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// DELETES THE ACTIVE PROFILE'S OWN REVIEW
async function deleteReview(req, res) {
    try {
        const review = await Review.findOneAndDelete({ _id: req.params.id, profile: req.session.activeProfileId });
        if (!review) return res.status(404).json({ success: false, message: "ביקורת לא נמצאה" });
        res.json({ success: true, message: "הביקורת נמחקה בהצלחה" });
    } catch (err) {
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

module.exports = { getReviews, createReview, editReview, deleteReview };
