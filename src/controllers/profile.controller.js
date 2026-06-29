//REQUEST HANDLER
const Profile = require("../models/profile.model");

// RETURNS ALL PROFILES FROM DATABASE
async function getProfile(req, res) {
    try{
        const profile = await Profile.find();
        res.json({success:true , profile});
    } catch(err){
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}

// RETURNS ONE PROFILE ITEM BY ID
async function getProfileById(req, res) {
    try{
        const profile = await Profile.findById(req.params.id);
        if(!profile) {
            return res.status(404).json({success: false, message: "הפרופיל לא נמצא"});
        }
        res.json({success:true , profile});
    } catch(err){
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }   
}

// CREATES NEW PROFILE
async function createProfile(req, res) {
    try{
        const {
            name,
            image,
            birthDate
        } = req.body;

        const exists = await Profile.findOne({ name });  
        if (exists) {
            return res.status(400).json({ success: false, message: "שם זה כבר קיים" });
        }

        const profile = await Profile.create({
            name,
            image,
            birthDate
        });

        res.status(201).json({success: true,profile});
    } catch(err){
        if(err.name==="ValidationError"){
            return res.status(400).json({success: false, message: "נתוני הפרופיל לא תקינים", error: err.message}); 
        }
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}
//DELETE PROFILE
async function deleteProfile(req, res) {
    try{
        const profile = await Profile.findByIdAndDelete(req.params.id);
        if (!profile) {
            return res.status(404).json({success: false,message: "פרופיל לא נמצא"});
        }
        res.json({success: true, message: "הפרופיל נמחק בהצלחה"});
    } catch(err){
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}
//UPDATE PROFILE
async function updateProfile(req, res) {
    try{
        const {
            name,
            image,
            birthDate
        } = req.body;

        const exists = await Profile.findOne({ name, _id: { $ne: req.params.id } });
        if (exists) {
            return res.status(400).json({ success: false, message: "שם זה כבר קיים" });
        }

        const profileData = {
            name,
            image,
            birthDate
        };
        const profile = await Profile.findByIdAndUpdate(
            req.params.id,
            profileData,
            {
                returnDocument: 'after',
                runValidators: true 
            }
        );
        if (!profile) {
            return res.status(404).json({success: false,message: "פרופיל לא נמצא"});
        }
        res.json({ success: true, profile });        
    }catch(err){
        if (err.name==="ValidationError"){
            return res.status(400).json({success: false, message: "נתוני פרופיל לא תקינים", error: err.message});
        }
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}

// SEARCH PROFILES BY NAME
async function searchProfiles(req, res) {
    try {
        const { name } = req.query;
        const filter = {};

        if (name){
            filter.name = { $regex: name, $options: "i" }; 
        }

        const profiles = await Profile.find(filter);

        if (profiles.length === 0) {
            return res.status(404).json({ success: false, message: "לא נמצאו פרופילים" });
        }

        res.json({ success: true, profiles });

    } catch (err) {
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

module.exports={
    getProfile,
    getProfileById,
    createProfile,
    deleteProfile,
    updateProfile,
    searchProfiles
};
