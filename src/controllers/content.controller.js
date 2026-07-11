//REQUEST HANDLER
const Content = require("../models/content.model");
const logger = require("../utils/logger");

// RETURNS ALL CONTENT FROM DATABASE
async function getContent(req, res) {
    try{
        const content = await Content.find();
        res.json({success:true , content});
    } catch(err){
        logger.logError(req.originalUrl, err);
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}

// RETURNS ONE CONTENT ITEM BY ID
async function getContentById(req, res) {
    try{
        const content = await Content.findById(req.params.id);
        if(!content) {
            return res.status(404).json({success: false, message: "התוכן לא נמצא"});
        }
        res.json({success:true , content});
    } catch(err){
        logger.logError(req.originalUrl, err);
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}

// CREATES NEW CONTENT
async function createContent(req, res) {
    try{
        const {
            title,
            year,
            type,
            genre,
            image,
            episodeLength,
            duration,
            description,
            origin,
            franchise,
            rating,
            videoUrl,
            filmingLocation
        } = req.body;

        const content = await Content.create({
            title,
            year,
            type,
            genre,
            image,
            episodeLength,
            duration,
            description,
            origin,
            franchise,
            rating,
            videoUrl,
            filmingLocation
        });

        res.status(201).json({success: true,content});
    } catch(err){
        if(err.name==="ValidationError"){
            return res.status(400).json({success: false, message: "נתוני התוכן לא תקינים", error: err.message}); 
        }
        logger.logError(req.originalUrl, err);
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}

// DELETES CONTENT BY ID
async function deleteContent(req, res) {
    try{
        const content = await Content.findByIdAndDelete(req.params.id);
        if (!content) {
            return res.status(404).json({success: false,message: "תוכן לא נמצא"});
        }
        res.json({success: true, message: "התוכן נמחק בהצלחה"});
    } catch(err){
        logger.logError(req.originalUrl, err);
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}

// UPDATES CONTENT BY ID
async function updateContent(req, res) {
    try {
        const {
            title,
            year,
            type,
            genre,
            image,
            episodeLength,
            duration,
            description,
            origin,
            franchise,
            rating,
            videoUrl,
            filmingLocation
        } = req.body;

        const contentData = {
            title,
            year,
            type,
            genre,
            image,
            description,
            origin,
            franchise,
            rating,
            videoUrl,
            filmingLocation
        };

        const updatedContent = {
            $set: contentData
        };

        if (type === "סדרה") {
            updatedContent.$set.episodeLength = episodeLength;
            updatedContent.$unset = { duration: "" };
        }

        else if (type === "סרט") {
            updatedContent.$set.duration = duration;
            updatedContent.$unset = { episodeLength: "" };
        }

        const content = await Content.findByIdAndUpdate(
            req.params.id,
            updatedContent,
            {
                returnDocument: 'after',
                runValidators: true 
            }
        );

        if (!content) {
            return res.status(404).json({success: false,message: "תוכן לא נמצא"});
        }

        res.json({ success: true,content });

    } catch (err) {
        if (err.name==="ValidationError"){
            return res.status(400).json({success: false, message: "נתוני תוכן לא תקינים", error: err.message});
        }
        logger.logError(req.originalUrl, err);
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}

async function searchContent(req, res) {
    try {
        const { q, title, genre, origin, franchise, description, year, ratingMin, ratingMax, maxLength } = req.query;
        const filter = {};
        const conditions = [];

        if (q) {
            const words = q.trim().split(/\s+/);
            conditions.push({ $and: words.map(word => ({
                $or: [
                    { title: { $regex: word, $options: "i" } },
                    { genre: { $regex: word, $options: "i" } },
                    { origin: { $regex: word, $options: "i" } },
                    { description: { $regex: word, $options: "i" } },
                    { franchise: { $regex: word, $options: "i" } }
                ]
            }))});
        }

        const addRegex = (field, values) =>
            [].concat(values).forEach(v => conditions.push({ [field]: { $regex: v, $options: "i" } }));
        const addExact = (field, values) =>
            [].concat(values).forEach(v => conditions.push({ [field]: v }));

        if (title)       addRegex("title", title);
        if (genre)       addExact("genre", genre);
        if (origin)      addExact("origin", origin);
        if (description) addRegex("description", description);
        if (franchise)   addRegex("franchise", franchise);
        if (year)        [].concat(year).forEach(v => conditions.push({ year: Number(v) }));
        if (ratingMin)   [].concat(ratingMin).forEach(v => conditions.push({ rating: { $gte: Number(v) } }));
        if (ratingMax)   [].concat(ratingMax).forEach(v => conditions.push({ rating: { $lte: Number(v) } }));
        if (maxLength)   [].concat(maxLength).forEach(v => conditions.push({
            $or: [
                { duration: { $lte: Number(v) } },
                { episodeLength: { $lte: Number(v) } }
            ]
        }));

        if (conditions.length) filter.$and = conditions;

        const content = await Content.find(filter);

        if (content.length === 0) {
            return res.status(404).json({ success: false, message: "לא נמצא תוכן" });
        }

        res.json({ success: true, content });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// ADVANCED SEARCH #2 (MAINPAGE) - GENRE + DECADE + MINIMUM RATING
// A DECADE (E.G. "1990") IS TRANSLATED TO A YEAR RANGE SERVER-SIDE, KEEPING THE LOGIC SEPARATE FROM searchContent
async function discoverContent(req, res) {
    try {
        const { genre, origin, decade, minRating } = req.query;
        const conditions = [];

        if (genre) conditions.push({ genre: genre });
        if (origin) conditions.push({ origin: origin });
        if (decade) {
            const start = Number(decade);
            conditions.push({ year: { $gte: start, $lte: start + 9 } });
        }
        if (minRating) conditions.push({ rating: { $gte: Number(minRating) } });

        const filter = conditions.length ? { $and: conditions } : {};
        const content = await Content.find(filter);
        res.json({ success: true, content });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// TOGGLES A LIKE FROM THE ACTIVE PROFILE ON THIS CONTENT
async function toggleLike(req, res) {
    try {
        const profileId = req.session.activeProfileId;
        const content = await Content.findById(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: "תוכן לא נמצא" });

        const index = content.likedBy.findIndex(id => id.toString() === profileId.toString());
        if (index === -1) content.likedBy.push(profileId);
        else content.likedBy.splice(index, 1);

        await content.save();
        res.json({ success: true, liked: index === -1 });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// RETURNS ALL CONTENT LIKED BY THE ACTIVE PROFILE
async function getLikedContent(req, res) {
    try {
        const content = await Content.find({ likedBy: req.session.activeProfileId });
        res.json({ success: true, content });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// FETCHES A RELEVANT YOUTUBE CLIP FOR THIS CONTENT'S OPENING/INTRO
async function getYoutubeClip(req, res) {
    try {
        const content = await Content.findById(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: "תוכן לא נמצא" });
        const query = encodeURIComponent(`${content.title} פתיחה`);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&videoDuration=short&relevanceLanguage=he&regionCode=IL&q=${query}&key=${process.env.YOUTUBE_API_KEY}`;
        const ytRes = await fetch(url);
        const data = await ytRes.json();
        const video = data.items?.[0];
        if (!video) return res.json({ success: true, video: null });
        res.json({ success: true, video: {
            videoId: video.id.videoId, title: video.snippet.title,
            thumbnail: video.snippet.thumbnails?.medium?.url
        }});
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

module.exports = {
    getContent,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
    searchContent,
    discoverContent,
    toggleLike,
    getLikedContent,
    getYoutubeClip
};