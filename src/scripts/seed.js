require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Content = require("../models/content.model");
const Profile = require("../models/profile.model");


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
        likes: 72
    },
    {
        title: "גאליס - קונקט",
        year: 2016,
        type: "סרט",
        duration: 98,
        genre: ["הרפתקאות", "פנטזיה", "נוער"],
        franchise: ["גאליס"],
        description: "",
        image: "Assets/Content/Movies/GalisConnect.png",
        likes: 2
    },
    {
        title: "אח שלי הגדול",
        year: 2002,
        type: "סרט",
        duration: 32,
        genre: ["דרמה", "ילדים", "נוער", "צבא", "יום הזיכרון"],
        description: "",
        image: "Assets/Content/Movies/BigBro.png",
        likes: 30
    }
];
const profiles = [
    {name: "ניב", image: "Assets/Users/chief.png", birthDate: "2000-04-09" },
    {name: "אוראל", image: "Assets/Users/Roni.png", birthDate: "2000-01-18" },
    {name: "ג'סי", image: "Assets/Users/fadida.png", birthDate: "2019-02-18" }
];

async function seed() {
    try {
        await connectDB();
        await Content.deleteMany({});
        await Content.insertMany(contentItems);
        console.log(`Seeded ${contentItems.length} content items`);
    } catch (err) {
        console.error("content seed failed:", err.message);
    } 
    try{
        await Profile.deleteMany({});
        await Profile.insertMany(profiles);
        console.log(`Seeded ${profiles.length} profiles`);
    } catch (err) {
        console.error("profiles seed failed:", err.message);
    }
    try {
        await User.deleteMany({});
        const hashedPassword = await bcrypt.hash("123456", 10);
        await User.create({
            name: "ניב",
            email: "user@example.com",
            password: hashedPassword
        });
        console.log("Seeded 1 user");
    } catch (err) {
        console.error("users seed failed:", err.message);
    } 
    finally {
        mongoose.connection.close();
    }
}

seed();