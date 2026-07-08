//REQUEST HANDLER
const Profile = require("../models/profile.model");

// RETURNS ALL PROFILES OF ALL USERS (ADMIN ONLY) 
async function getAllProfiles(req, res) {
    try {
        const profiles = await Profile.find().populate("user", "name email");
        res.json({ success: true, profiles });
    } catch (err) {
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

// RETURNS ALL PROFILES OF THE LOGGED-IN USER
async function getProfile(req, res) {
    try{
        const profile = await Profile.find({ user: req.session.userId });
        res.json({success:true , profile});
    } catch(err){
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}

// RETURNS ONE PROFILE ITEM BY ID (OWNER ONLY, VERIFIED BY requireProfileOwner)
async function getProfileById(req, res) {
    res.json({ success: true, profile: req.ownedProfile });
}

// CREATES NEW PROFILE FOR THE LOGGED-IN USER
async function createProfile(req, res) {
    try{
        const {
            name,
            image,
            birthDate
        } = req.body;

        const exists = await Profile.findOne({ name, user: req.session.userId });
        if (exists) {
            return res.status(400).json({ success: false, message: "שם זה כבר קיים" });
        }

        const profile = await Profile.create({
            user: req.session.userId,
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
//DELETE PROFILE (OWNER ONLY, VERIFIED BY requireProfileOwner)
async function deleteProfile(req, res) {
    try{
        await req.ownedProfile.deleteOne();
        res.json({success: true, message: "הפרופיל נמחק בהצלחה"});
    } catch(err){
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}
//UPDATE PROFILE (OWNER ONLY, VERIFIED BY requireProfileOwner)
async function updateProfile(req, res) {
    try{
        const {
            name,
            image,
            birthDate
        } = req.body;

        const exists = await Profile.findOne({ name, user: req.session.userId, _id: { $ne: req.params.id } });
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
        res.json({ success: true, profile });
    }catch(err){
        if (err.name==="ValidationError"){
            return res.status(400).json({success: false, message: "נתוני פרופיל לא תקינים", error: err.message});
        }
        res.status(500).json({success: false, message: 'שגיאת שרת', error: err.message});
    }
}

// SEARCH PROFILES BY NAME (LOGGED-IN USER ONLY)
async function searchProfiles(req, res) {
    try {
        const { name } = req.query;
        const filter = { user: req.session.userId };

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

// MARKS THIS PROFILE AS THE ACTIVE ONE FOR THIS SESSION (OWNER ONLY, VERIFIED BY requireProfileOwner)
async function selectProfile(req, res) {
    const activeProfile = req.ownedProfile;
    req.session.activeProfileId = activeProfile._id;
    res.json({ success: true });
}

// RETURNS THE CURRENTLY ACTIVE PROFILE FOR THIS SESSION
async function getActiveProfile(req, res) {
    try {
        const profile = await Profile.findOne({ _id: req.session.activeProfileId, user: req.session.userId });
        if (!profile) {
            return res.status(404).json({ success: false, message: "אין פרופיל פעיל" });
        }
        res.json({ success: true, profile });
    } catch (err) {
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

module.exports={
    selectProfile,
    getAllProfiles,
    getActiveProfile,
    getProfile,
    getProfileById,
    createProfile,
    deleteProfile,
    updateProfile,
    searchProfiles
};
