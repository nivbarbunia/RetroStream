const User = require("../models/user.model");
// Protects routes — redirects to login page if not authenticated
function requireLogin(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect("/");
    }
}
async function requireAdmin(req, res, next) {
    const user = await User.findById(req.session.userId);
    if (user && user.role === "admin") {
        next();
    } else {
        res.status(403).json({ success: false, message: "אין הרשאה" });
    }
}

// Protects admin HTML pages
async function requireAdminPage(req, res, next) {
    const user = await User.findById(req.session.userId);
    if (user && user.role === "admin") {
        next();
    } else {
        res.redirect("/");
    }
}
module.exports = { requireLogin, requireAdmin, requireAdminPage };