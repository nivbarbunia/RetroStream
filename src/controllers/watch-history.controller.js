const WatchHistory = require("../models/watch-history.model");

// RETURNS ALL WATCH HISTORY ENTRIES
async function getWatchHistory(req, res) {
    try {
        const history = await WatchHistory.find().populate("content").populate("profile");
        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// RETURNS ONE WATCH HISTORY ENTRY BY ID
async function getWatchHistoryById(req, res) {
    try {
        const entry = await WatchHistory.findById(req.params.id).populate("content").populate("profile");
        if (!entry) return res.status(404).json({ success: false, message: "רשומה לא נמצאה" });
        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// CREATES A NEW WATCH HISTORY ENTRY (MANUAL, ADMIN USE)
async function createWatchHistory(req, res) {
    try {
        const { user, profile, content, progress, completed, watchedAt } = req.body;
        const entry = await WatchHistory.create({ user, profile, content, progress, completed, watchedAt });
        res.status(201).json({ success: true, entry });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: "נתונים לא תקינים", error: err.message });
        }
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// UPDATES A WATCH HISTORY ENTRY BY ID (MANUAL, ADMIN USE)
async function updateWatchHistory(req, res) {
    try {
        const { progress, completed, watchedAt } = req.body;
        const entry = await WatchHistory.findByIdAndUpdate(
            req.params.id,
            { $set: { progress, completed, watchedAt } },
            { returnDocument: 'after', runValidators: true }
        );
        if (!entry) return res.status(404).json({ success: false, message: "רשומה לא נמצאה" });
        res.json({ success: true, entry });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: "נתונים לא תקינים", error: err.message });
        }
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// DELETES A WATCH HISTORY ENTRY BY ID (SCOPED TO THE ACTIVE PROFILE - USER CAN ONLY DELETE THEIR OWN)
async function deleteWatchHistory(req, res) {
    try {
        const profileId = req.session.activeProfileId;
        const entry = await WatchHistory.findOneAndDelete({ _id: req.params.id, profile: profileId });
        if (!entry) return res.status(404).json({ success: false, message: "רשומה לא נמצאה" });
        res.json({ success: true, message: "הרשומה נמחקה בהצלחה" });
    } catch (err) {
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// SEARCHES WATCH HISTORY BY USER / PROFILE / CONTENT / COMPLETED
async function searchWatchHistory(req, res) {
    try {
        const { user, profile, content, completed } = req.query;
        const filter = {};
        if (user) filter.user = user;
        if (profile) filter.profile = profile;
        if (content) filter.content = content;
        if (completed !== undefined) filter.completed = completed === "true";

        const history = await WatchHistory.find(filter).populate("content").populate("profile");
        if (history.length === 0) {
            return res.status(404).json({ success: false, message: "לא נמצאו רשומות" });
        }
        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// CREATES/UPDATES PROGRESS FOR THE ACTIVE PROFILE ON A CONTENT ITEM (CALLED FROM THE VIDEO PLAYER)
async function upsertProgress(req, res) {
    try {
        const userId = req.session.userId;
        const profileId = req.session.activeProfileId;
        if (!userId || !profileId) {
            return res.status(401).json({ success: false, message: "אין פרופיל פעיל" });
        }
        const { contentId, progress, completed, duration } = req.body;

        const entry = await WatchHistory.findOneAndUpdate(
            { profile: profileId, content: contentId },
            { $set: { user: userId, progress, completed, duration, watchedAt: new Date() } },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true }
        );
        res.json({ success: true, entry });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: "נתונים לא תקינים", error: err.message });
        }
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// RETURNS "CONTINUE WATCHING" LIST FOR THE ACTIVE PROFILE
async function getContinueWatching(req, res) {
    try {
        const profileId = req.session.activeProfileId;
        const history = await WatchHistory.find({ profile: profileId, completed: false })
        .sort({ watchedAt: -1 }).populate("content");
        
        res.json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

module.exports = {
    getWatchHistory,
    getWatchHistoryById,
    createWatchHistory,
    updateWatchHistory,
    deleteWatchHistory,
    searchWatchHistory,
    upsertProgress,
    getContinueWatching
};