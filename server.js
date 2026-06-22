const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
const PORT = 3000;

const profiles = [
    { id: 1, name: "ניב", image: "Assets/Users/chief.png" },
    { id: 2, name: "אוראל", image: "Assets/Users/Roni.png" },
    { id: 3, name: "ג'סי", image: "Assets/Users/fadida.png" }
];
 let nextId = 4;


// הגשת קבצים סטטיים מתיקיית RetroStream
app.use(express.static(path.join(__dirname, "RetroStream")));
app.use(express.json());
app.use(session({
    secret: "retrostream_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // one hour
}));

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
  res.sendFile(path.join(__dirname, "RetroStream", "Login.html"));
});

//Get /Profiles page
app.get("/profiles", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "RetroStream", "ProfilesScreen.html"));
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

//listening
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
