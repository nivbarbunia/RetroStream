const Content = require("../models/content.model");
const WatchHistory = require("../models/watch-history.model");
const logger = require("../utils/logger");

// COUNTS CATALOG ITEMS AND WATCHES PER CHANNEL
async function getStatsByOrigin(req, res) {
    try {
        // catalog: unpack each content's origin array, bucket by channel, count
        const catalog = await Content.aggregate([
            { $unwind: "$origin" },
            { $group: { _id: "$origin", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        // watches: join each history record with its content, then bucket by the content's channel
        const watches = await WatchHistory.aggregate([
            { $lookup: { from: "contents", localField: "content", foreignField: "_id", as: "contentDoc" } },
            { $unwind: "$contentDoc" },
            { $unwind: "$contentDoc.origin" },
            { $group: { _id: "$contentDoc.origin", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json({ success: true, catalog, watches });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// COUNTS CATALOG ITEMS AND WATCHES PER GENRE
async function getStatsByGenre(req, res) {
    try {
        const catalog = await Content.aggregate([
            { $unwind: "$genre" },
            { $group: { _id: "$genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const watches = await WatchHistory.aggregate([
            { $lookup: { from: "contents", localField: "content", foreignField: "_id", as: "contentDoc" } },
            { $unwind: "$contentDoc" },
            { $unwind: "$contentDoc.genre" },
            { $group: { _id: "$contentDoc.genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json({ success: true, catalog, watches });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// TOP 10 MOST-WATCHED CONTENT ITEMS (BY NUMBER OF PROFILES THAT WATCHED)
async function getTopWatched(req, res) {
    try {
        const top = await WatchHistory.aggregate([
            { $group: { _id: "$content", views: { $sum: 1 } } },
            { $sort: { views: -1 } },
            { $limit: 10 },
            { $lookup: { from: "contents", localField: "_id", foreignField: "_id", as: "content" } },
            { $unwind: "$content" }
        ]);
        res.json({ success: true, top });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// TOP 10 MOST-LIKED CONTENT ITEMS (BY NUMBER OF PROFILES IN likedBy)
async function getTopLiked(req, res) {
    try {
        const top = await Content.aggregate([
            { $project: { title: 1, image: 1, likes: { $size: { $ifNull: ["$likedBy", []] } } } },
            { $match: { likes: { $gt: 0 } } },
            { $sort: { likes: -1 } },
            { $limit: 10 }
        ]);
        res.json({ success: true, top });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// KPI TOTALS: CATALOG SIZE + TOTAL SECONDS WATCHED
async function getTotals(req, res) {
    try {
        const contentCount = await Content.countDocuments();
        const result = await WatchHistory.aggregate([
            { $group: { _id: null, totalSeconds: { $sum: "$progress" } } }
        ]);
        res.json({ success: true, contentCount, totalSeconds: result[0]?.totalSeconds || 0 });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

module.exports = { getStatsByOrigin, getStatsByGenre, getTopWatched, getTopLiked, getTotals };