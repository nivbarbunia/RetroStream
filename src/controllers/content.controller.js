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
                new: true,
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
        const { q, title, genre, origin, franchise, description } = req.query;
        const filter = {};

        if (q) {
            const words = q.trim().split(/\s+/);
            filter.$and = words.map(word => ({
                $or: [
                    { title: { $regex: word, $options: "i" } },
                    { genre: { $regex: word, $options: "i" } },
                    { origin: { $regex: word, $options: "i" } },
                    { description: { $regex: word, $options: "i" } },
                    { franchise: { $regex: word, $options: "i" } }
                ]
            }));
        }   
        if (title)  filter.title  = { $regex: title, $options: "i" };
        if (genre)  filter.genre  = { $in: [genre] };
        if (origin) filter.origin = { $in: [origin] };
        if (description) filter.description = {$regex: description, $options: "i"};
        if (franchise) filter.franchise = {$regex: franchise, $options: "i"};

        const content = await Content.find(filter);

        if (content.length === 0) {
            return res.status(404).json({ success: false, message: "לא נמצא תוכן" });
        }

        res.json({ success: true, content });
    } catch (err) {
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

module.exports = {
    getContent,
    getContentById,
    createContent,
    updateContent,
    deleteContent,
    searchContent
};