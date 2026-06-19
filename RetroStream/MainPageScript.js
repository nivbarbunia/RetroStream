const searchBox = document.querySelector(".search-box");
const searchToggle = document.getElementById("searchToggle");
const searchInput = document.getElementById("searchInput");

//NAVBAR FUNCTIONS
searchToggle.addEventListener("click", function () {
  searchBox.classList.add("open");

  if (searchBox.classList.contains("open")) {
    searchInput.focus();
  }
});

searchInput.addEventListener("blur", function () {
  searchBox.classList.remove("open");
});

// CONTENT ARRAY
const contentItems = [
   {
     title: "הפיג'מות",
     year: 2003,
     type: "סדרה",
     episodeLength: 25,
     genre: ["קומדיה"],
     origin: ["ערוץ הילדים"],
     description:"",
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
      description:"כשאסון עולמי מאיים להשמיד את האנושות, חבורת צעירים מוצאת את עצמה במרכזה של מזימה חוצת זמנים. האם ניתן לשנות את העתיד?",
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
      description:"ארבעה חברים רווקים המתגוררים בלב תל אביב מנסים לנווט בין מערכות יחסים, עבודה וחיי היומיום. בכל פרק הם נקלעים לסיטואציות חדשות, מסתבכים בדרכים לא צפויות ונעזרים זה בזה כדי להתמודד עם האבומינציה שהיא: תל אביב.",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
      image: "Assets/Content/Series/osher.png",
      likes: 19
   },
   {
      title: "אליפים",
      year: 2010,
      type: "סדרה",
      episodeLength: 25,
      genre: [ "דרמה", "נוער"],
      origin: ["ערוץ הילדים", "yes"],
      description:"",
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
      description:"",
      image: "Assets/Content/Series/Metim.png",
      likes: 72
   },
   {
      title: "גאליס - קונקט",
      year: 2016,
      type: "סרט",
      duration: 98,
      genre: ["הרפתקאות", "פנטזיה", "נוער"],
      franchise: "גאליס",
      description:"",
      image: "Assets/Content/Movies/GalisConnect.png",
      likes: 2
   },  
   {
      title: "אח שלי הגדול",
      year: 2002,
      type: "סרט",
      duration: 32,
      genre: ["דרמה", "ילדים", "נוער", "צבא", "יום הזיכרון"],
      franchise: null,
      description:"",
      image: "Assets/Content/Movies/BigBro.png",
      likes: 30 
    }
];

const heroSection = document.getElementById("heroSection");
const featuredItem = contentItems[3];

// HERO SECTION
heroSection.innerHTML= `
   <div class="hero-content">
      <div class="hero-text">
         <p class="hero-label">המלצת השבוע</p>
         <div class="hero-heading">
            <h1 class="hero-title">${featuredItem.title}</h1>
            <span class="hero-details">${featuredItem.year} · ${featuredItem.genre[0]} · ${featuredItem.origin?.[0] || featuredItem.genre[1]}</span>
         </div>   
         <p class="hero-desc">${featuredItem.description}</p>
         <button class="hero-btn">צפה עכשיו ▶</button>
      </div>
      <img class="hero-img" src="${featuredItem.image}" alt="${featuredItem.title}">
   </div>         
`;

const feedContainer = document.getElementById("feedContainer");

function renderCard(item) {
   return `
      <article class="content-card"> 
         <img class="content-img" src="${item.image}" alt="${item.title}">
         <h3 class="content-title">${item.title}</h3>
         <p class="content-details">${item.year} · ${item.genre[0]}</p>
    </article>      
   `;
}

function renderSection(title, items){
   if(items.length===0) return "";
   return `
      <section class="content-section">
         <h2 class="section-title">${title}</h2>
         <div class="feed-row"> 
            ${items.map(renderCard).join("")}
         </div>
      </section>      
   `;
}

function renderFeed() {
   const top10 = [...contentItems].sort((a,b)=> b.likes - a.likes).slice(0,10); //allocate top 10 contents
   feedContainer.innerHTML=`
      ${renderSection("המשך צפייה", contentItems.slice(0,5))}
      ${renderSection("קומדיה", contentItems.filter(item => item.genre.includes("קומדיה")))}
      ${renderSection("דרמה",contentItems.filter(item=>item.genre.includes("דרמה")))}
      ${renderSection("טופ 10 ברטרו סטרים",top10)}
      ${renderSection("צפייה קלילה", contentItems.filter(item => item.type==="סדרה" && item.episodeLength<=25))}
   `;
}
renderFeed();

