const bcrypt = require("bcrypt");
const User = require("../models/user.model");

// LIST all users (admin)
async function getUsers(req, res) {
    try {
        const users = await User.find().select("-password");
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// SEARCH users by name or email (admin)
async function searchUsers(req, res) {
    try {
        const { name, email, role } = req.query;
        const filter = {};
        if (name)  filter.name  = { $regex: name, $options: "i" };
        if (email) filter.email = { $regex: email, $options: "i" };
        if (role)  filter.role  = role;

        const users = await User.find(filter).select("-password");
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "לא נמצאו משתמשים" });
        }
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// GET the currently logged-in user ("my account")
async function getMe(req, res) {
    try {
        const user = await User.findById(req.session.userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
        }
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}
// UPDATE a user — self or admin
async function updateUser(req, res) {
    try {
        const targetId = req.params.id;
        const requester = await User.findById(req.session.userId);

        // permission: must be the same user, or an admin
        const isSelf = targetId === req.session.userId.toString();
        const isAdmin = requester && requester.role === "admin";
        if (!isSelf && !isAdmin) {
            return res.status(403).json({ success: false, message: "אין הרשאה" });
        }
        
        const { name, email, password, currentPassword } = req.body;
        const update = {};
        if (name)  update.name = name;
        if (email) update.email = email;
        // if password is being changed, verify current password (unless admin)
        if (password){
            if (isSelf) {
                const target = await User.findById(targetId);
                const match = await bcrypt.compare(currentPassword || "", target.password);
                if (!match) {
                    return res.status(400).json({ success: false, message: "הסיסמה הנוכחית שגויה" });
                }
            }    
            update.password = await bcrypt.hash(password, 10);
        }    
        const user = await User.findByIdAndUpdate(
            targetId,
            update,
            { returnDocument: "after", runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
        }
        res.json({ success: true, user });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: "נתוני משתמש לא תקינים", error: err.message });
        }
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// DELETE a user — self or admin
async function deleteUser(req, res) {
    try {
        const targetId = req.params.id;
        const requester = await User.findById(req.session.userId);

        const isSelf = targetId === req.session.userId.toString();
        const isAdmin = requester && requester.role === "admin";
        if (!isSelf && !isAdmin) {
            return res.status(403).json({ success: false, message: "אין הרשאה" });
        }

        const user = await User.findByIdAndDelete(targetId);
        if (!user) {
            return res.status(404).json({ success: false, message: "משתמש לא נמצא" });
        }

        // if a user deleted their own account, end their session
        if (isSelf) {
            req.session.destroy();
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

module.exports = { getUsers, searchUsers, getMe, updateUser, deleteUser };