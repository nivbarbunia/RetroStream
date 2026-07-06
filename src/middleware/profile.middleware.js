const Profile = require("../models/profile.model");

// VERIFIES :id REFERS TO A PROFILE OWNED BY THE LOGGED-IN USER, ATTACHES IT TO req.ownedProfile
async function requireProfileOwner(req, res, next) {
    try {
        const profile = await Profile.findById(req.params.id);
        if (!profile || profile.user.toString() !== req.session.userId.toString()) {
            return res.status(404).json({ success: false, message: "הפרופיל לא נמצא" });
        }
        req.ownedProfile = profile;
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: 'שגיאת שרת', error: err.message });
    }
}

module.exports = { requireProfileOwner };
