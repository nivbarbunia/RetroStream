// Protects routes — redirects to login page if not authenticated
function requireLogin(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect("/");
    }
}

module.exports = requireLogin;