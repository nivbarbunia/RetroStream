const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// הגשת קבצים סטטיים מתיקיית RetroStream
app.use(express.static(path.join(__dirname, "RetroStream")));
app.use(express.json());

//GETS
// GET / — מחזיר את עמוד ההתחברות
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "RetroStream", "Login.html"));
});

//GET /Profiles
app.get("/profiles", (req, res) => {
  res.sendFile(path.join(__dirname, "RetroStream", "ProfilesScreen.html"));
});

//POST /login - gets email & password - returns success || !success
app.post("/login", (req, res) => {
    const{email,password} = req.body;

    if(!email || !password){
        return res.json({success: false, message: "שדות חסרים"});
    }

    if(email=== "user@example.com" && password==="123456"){
        return res.json({success:true});
    }
    return res.json({success:false, message: "אימייל או סיסמא שגויים"})
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
