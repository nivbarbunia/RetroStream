//EXTERNAL PACKAGES
const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt"); 
//MIDDLEWARE
const requireLogin = require("./middleware/auth.middleware");
//ROUTES
const User = require("./models/user.model");
const contentRoutes = require("./routes/content.routes");
const profileRoutes = require("./routes/profile.routes");
const postRoutes = require("./routes/post.routes");

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

// PAGE routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views", "login.html")));
app.get("/main", requireLogin, (req, res) => res.sendFile(path.join(__dirname, "views", "mainpage.html")));
app.get("/profiles", requireLogin, (req, res) => res.sendFile(path.join(__dirname, "views", "profiles.html")));
app.get("/feed", requireLogin, (req, res) => res.sendFile(path.join(__dirname, "views", "feed.html")));

// auth (inline for now — moves to feature/authentication later)
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: "שדות חסרים" });
    }
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.loggedIn = true;
        return res.json({ success: true });
    }
    return res.json({ success: false, message: "אימייל או סיסמא שגויים" });
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

module.exports = app;