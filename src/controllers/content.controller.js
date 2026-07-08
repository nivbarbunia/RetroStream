//REQUEST HANDLER
const Content = require("../models/content.model");

// RETURNS ALL CONTENT FROM DATABASE
async function getContent(req, res) {
    try{
        const content = await Content.find();
        res.json({success:true , content});
    } catch(err){
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
            videoUrl
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
            videoUrl
        });

        res.status(201).json({success: true,content});
    } catch(err){
        if(err.name==="ValidationError"){
            return res.status(400).json({success: false, message: "נתוני התוכן לא תקינים", error: err.message}); 
        }
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
            videoUrl
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
            videoUrl
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
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// RETURNS ALL CONTENT LIKED BY THE ACTIVE PROFILE
async function getLikedContent(req, res) {
    try {
        const content = await Content.find({ likedBy: req.session.activeProfileId });
        res.json({ success: true, content });
    } catch (err) {
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

module.exports = {
    getContent,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
    searchContent,
    toggleLike,
    getLikedContent
};