//EXTERNAL PACKAGES
const express = require("express");
const path = require("path");
const session = require("express-session");
//MIDDLEWARE
const { requireLogin, requireAdminPage } = require("./middleware/auth.middleware");
//ROUTES
const contentRoutes = require("./routes/content.routes");
const profileRoutes = require("./routes/profile.routes");
const postRoutes = require("./routes/post.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
//MODELS
const User = require("./models/user.model");
const app = express();

// static files + JSON parser + session
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(session({
    secret: "retrostream_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // one hour
}));

// API routes
app.use("/api/posts", postRoutes); //temporary
app.use("/api/content", requireLogin, contentRoutes);
app.use("/api/profiles", requireLogin, profileRoutes);
app.use("/api/users", userRoutes);

// PAGE routes
app.get("/", async (req, res) => {
    if (req.session.userId) {
        const user = await User.findById(req.session.userId);
        if (user) {
            return res.redirect(user.role === "admin" ? "/admin" : "/profiles");
        }
    }
    res.sendFile(path.join(__dirname, "views", "login.html"));
});
app.get("/main", requireLogin, (req, res) => res.sendFile(path.join(__dirname, "views", "mainpage.html")));
app.get("/profiles", requireLogin, (req, res) => res.sendFile(path.join(__dirname, "views", "profiles.html")));
app.get("/feed", requireLogin, (req, res) => res.sendFile(path.join(__dirname, "views", "feed.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "views", "register.html")));
app.get("/account", requireLogin, (req, res) => res.sendFile(path.join(__dirname, "views", "account.html")));
app.get("/admin", requireLogin, requireAdminPage, (req, res) => res.sendFile(path.join(__dirname, "views", "admin.html")));
app.get("/admin/users", requireLogin, requireAdminPage, (req, res) => res.sendFile(path.join(__dirname, "views", "admin-users.html")));
app.get("/admin/content", requireLogin, requireAdminPage, (req, res) => res.sendFile(path.join(__dirname, "views", "admin-content.html")));

// auth
app.use("/api/auth", authRoutes);

module.exports = app;