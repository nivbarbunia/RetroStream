const express = require("express");
const path = require("path");
const session = require("express-session");
const app = express();
const PORT = 3000;

const contentItems = [
    {
        title: "הפיג'מות",
        year: 2003,
        type: "סדרה",
        episodeLength: 25,
        genre: ["קומדיה"],
        origin: ["ערוץ הילדים"],
        description: "",
        image: "Assets/Content/Series/Pijamot.png",
        liked: false,
        likes: 200
    },
    {
        title: "האי",
        year: 2007,
        episodeLength: 28,
        type: "סדרה",
        genre: ["מדע בדיוני", "דרמה", "נוער"],
        origin: ["ערוץ הילדים", "hot"],
        description: "כשאסון עולמי מאיים להשמיד את האנושות, חבורת צעירים מוצאת את עצמה במרכזה של מזימה חוצת זמנים. האם ניתן לשנות את העתיד?",
        image: "Assets/Content/Series/Hai.png",
        liked: false,
        likes: 201
    },
    {
        title: "החברים של נאור",
        year: 2006,
        type: "סדרה",
        episodeLength: 40,
        genre: ["קומדיה"],
        origin: ["ערוצים ישראלים", "קשת"],
        description: "ארבעה חברים רווקים המתגוררים בלב תל אביב מנסים לנווט בין מערכות יחסים, עבודה וחיי היומיום. בכל פרק הם נקלעים לסיטואציות חדשות, מסתבכים בדרכים לא צפויות ונעזרים זה בזה כדי להתמודד עם האבומינציה שהיא: תל אביב.",
        image: "Assets/Content/Series/Naor.png",
        liked: false,
        likes: 20
    },
    {
        title: "החממה",
        year: 2012,
        type: "סדרה",
        episodeLength: 25,
        genre: ["מדע בדיוני", "דרמה", "נוער"],
        origin: ["ניקלודיאון", "yes"],
        description: "",
        image: "Assets/Content/Series/hamama.png",
        liked: false,
        likes: 100
    },
    {
        title: "בובספוג",
        year: 1999,
        type: "סדרה",
        episodeLength: 20,
        genre: ["מצוייר", "ילדים"],
        origin: ["ניקלודיאון"],
        description: "",
        image: "Assets/Content/Series/sponge.png",
        liked: false,
        likes: 87
    },
    {
        title: "פיניאס ופרב",
        year: 2007,
        type: "סדרה",
        episodeLength: 20,
        genre: ["מצוייר", "ילדים"],
        origin: ["דיסני"],
        description: "",
        image: "Assets/Content/Series/PnP.png",
        liked: false,
        likes: 59
    },
    {
        title: "גור ואוח",
        year: 2001,
        type: "סדרה",
        episodeLength: 25,
        genre: ["קומדיה"],
        origin: ["ג'טיקס"],
        description: "",
        image: "Assets/Content/Series/Gurveoach.png",
        liked: false,
        likes: 49
    },
    {
        title: "זומזום",
        year: 2005,
        type: "סדרה",
        episodeLength: 25,
        genre: ["קומדיה"],
        origin: ["ערוץ הילדים", "יס"],
        description: "",
        image: "Assets/Content/Series/Zumzum.png",
        liked: false,
        likes: 39
    },
    {
        title: "אדומות",
        year: 2004,
        type: "סדרה",
        episodeLength: 25,
        genre: ["דרמה"],
        origin: ["ערוץ הילדים"],
        description: "",
        image: "Assets/Content/Series/Adumot.png",
        liked: false,
        likes: 20
    },
    {
        title: "שמש",
        year: 1997,
        type: "סדרה",
        episodeLength: 25,
        genre: ["קומדיה"],
        origin: ["ערוצים ישראלים"],
        description: "",
        image: "Assets/Content/Series/Shemesh.png",
        liked: false,
        likes: 102
    },
    {
        title: "האלופה",
        year: 2006,
        type: "סדרה",
        episodeLength: 35,
        genre: ["טלנובלה"],
        origin: ["ערוצים ישראלים"],
        description: "",
        image: "Assets/Content/Series/Alufa.png",
        liked: false,
        likes: 12
    },
    {
        title: "השועלים",
        year: 2010,
        type: "סדרה",
        episodeLength: 20,
        genre: ["קומדיה"],
        origin: ["yes", "ניקלודיאון"],
        description: "",
        image: "Assets/Content/Series/fox.png",
        liked: false,
        likes: 4
    },
    {
        title: "לגעת באושר",
        year: 2001,
        type: "סדרה",
        episodeLength: 50,
        genre: ["טלנובלה"],
        origin: ["ויוה"],
        description: "",
        image: "Assets/Content/Series/osher.png",
        liked: false,
        likes: 19
    },
    {
        title: "אליפים",
        year: 2010,
        type: "סדרה",
        episodeLength: 25,
        genre: ["דרמה", "נוער"],
        origin: ["ערוץ הילדים", "yes"],
        description: "",
        image: "Assets/Content/Series/Alifim.png",
        liked: false,
        likes: 46
    },
    {
        title: "מתים לרגע",
        year: 2014,
        type: "סדרה",
        episodeLength: 30,
        genre: ["מדע בדיוני", "דרמה"],
        origin: ["hot"],
        description: "",
        image: "Assets/Content/Series/Metim.png",
        liked: false,
        likes: 72
    },
    {
        title: "גאליס - קונקט",
        year: 2016,
        type: "סרט",
        duration: 98,
        genre: ["הרפתקאות", "פנטזיה", "נוער"],
        franchise: "גאליס",
        description: "",
        image: "Assets/Content/Movies/GalisConnect.png",
        liked: false,
        likes: 2
    },
    {
        title: "אח שלי הגדול",
        year: 2002,
        type: "סרט",
        duration: 32,
        genre: ["דרמה", "ילדים", "נוער", "צבא", "יום הזיכרון"],
        franchise: null,
        description: "",
        image: "Assets/Content/Movies/BigBro.png",
        liked: false,
        likes: 30
    }
];

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

// Get /main — feed page
app.get("/main", requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "RetroStream", "MainPage.html"));
});

// Get /content — content items array
app.get("/content", requireLogin, (req, res) => {
    res.json(contentItems);
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

// POST /logout — destroy session
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

//listening
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
