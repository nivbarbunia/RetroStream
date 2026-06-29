const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const connectDB = require("./config/db");
const postRoutes = require("./routes/post.routes");
const bcrypt = require("bcrypt");
const User = require("./models/user.model");
const contentRoutes = require("./routes/content.routes");
const profileRoutes = require("./routes/profile.routes");
const app = express();
const PORT = 3000;


//Serve static files (CSS, JS, assets) from public folder
app.use(express.static(path.join(__dirname, "public")));
//Parse incoming JSON request bodies
app.use(express.json());
//Middleware session - login state: 1 hour
app.use(session({
    secret: "retrostream_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // one hour
}));

//connect to mongoDB and register post routes
connectDB();
app.use("/api/posts", postRoutes);
app.use("/api/content", requireLogin, contentRoutes);
app.use("/api/profiles", requireLogin, profileRoutes);

function requireLogin(req, res, next){
  if(req.session.loggedIn){
    next();
  } else{
    res.redirect("/");
  }
}

//GETS

// Get / — login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Get /main — feed page
app.get("/main", requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "mainpage.html"));
});


//Get /Profiles page
app.get("/profiles", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "profiles.html"));
});

//GET POSTS FEED PAGE
app.get("/feed", requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "feed.html"));
});

//POSTS

//Post /login - gets email & password - returns success || !success
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

// POST /logout — destroy session
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

//listening
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
