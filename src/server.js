const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const connectDB = require("./config/db");
const postRoutes = require("./routes/post.routes");
const contentRoutes = require("./routes/content.routes");
const app = express();
const PORT = 3000;


const profiles = [
    { id: 1, name: "ניב", image: "Assets/Users/chief.png" },
    { id: 2, name: "אוראל", image: "Assets/Users/Roni.png" },
    { id: 3, name: "ג'סי", image: "Assets/Users/fadida.png" }
];
let nextId = 4;




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
app.use("/posts", postRoutes);
app.use("/content", requireLogin, contentRoutes);

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

//Get personas array
app.get("/profiles/data", requireLogin, (req, res) => {
    res.json(profiles);
});

//POSTS

//Post /login - gets email & password - returns success || !success
app.post("/login", (req, res) => {
    const{email,password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: "שדות חסרים"});
    }

    if(email=== "user@example.com" && password==="123456"){
        req.session.loggedIn = true;
        return res.json({success:true});
    }
    return res.json({success:false, message: "אימייל או סיסמא שגויים"})
})
//post /ADD PROFILE
app.post("/profiles", requireLogin,(req,res) =>{
  const{name,image} = req.body;
  const newProfile = {id: nextId++, name, image};
  const exists = profiles.some(p=> p.name===name);
  if (exists) return res.json({success:false, message: "שם זה כבר קיים"});
  profiles.push(newProfile);
  res.json({success: true, profile: newProfile});
});



// PUT /profiles/:id — עדכון פרסונה
app.put("/profiles/:id", requireLogin, (req, res) => {
    const id = parseInt(req.params.id);
    const { name, image } = req.body;
    const profile = profiles.find(p => p.id === id);

    if (!profile) return res.json({ success: false, message: "פרסונה לא נמצאה" });

    if (name) profile.name = name;
    if (image) profile.image = image;

    res.json({ success: true, profile });
});

// DELETE /profiles/:id — מחיקת פרסונה
app.delete("/profiles/:id", requireLogin, (req, res) => {
    const id = parseInt(req.params.id);
    const index = profiles.findIndex(p => p.id === id);

    if (index === -1) return res.json({ success: false, message: "פרסונה לא נמצאה" });

    profiles.splice(index, 1);
    res.json({ success: true });
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
