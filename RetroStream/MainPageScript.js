const searchBox = document.querySelector(".search-box");
const searchToggle = document.getElementById("searchToggle");
const searchInput = document.getElementById("searchInput");


searchToggle.addEventListener("click", function () {
  searchBox.classList.add("open");

  if (searchBox.classList.contains("open")) {
    searchInput.focus();
  }
});

searchInput.addEventListener("blur", function () {
  searchBox.classList.remove("open");
});

// 
const contentItems = [
   {
     title: "הפיג'מות",
     year: 2003,
     type: "סדרה",
     episodeLength: 25,
     genre: ["קומדיה"],
     origin: ["ערוץ הילדים"],
     image: "Assets/Content/Series/Pijamot.png",
     likes: 0
   },
   {
      title: "האי",
      year: 2007,
      episodeLength: 28,
      type: "סדרה",
      genre: ["מדע בדיוני", "דרמה", "נוער"],
      origin: ["ערוץ הילדים", "hot"],
      image: "Assets/Content/Series/Hai.png",
      likes: 0
   },
   {
      title: "החברים של נאור",
      year: 2006,
      type: "סדרה",
      episodeLength: 40,
      genre: ["קומדיה"],
      origin: ["ערוצים ישראלים", "קשת"],
      image: "Assets/Content/Series/Naor.png",
      likes: 0
   },
   {
      title: "החממה",
      year: 2012,
      type: "סדרה",
      episodeLength: 25,
      genre: ["מדע בדיוני", "דרמה", "נוער"],
      origin: ["ניקלודיאון", "yes"],
      image: "Assets/Content/Series/hamama.png",
      likes: 0
   },
   {
      title: "בובספוג",
      year: 1999,
      type: "סדרה",
      episodeLength: 20,
      genre: ["מצוייר", "ילדים"],
      origin: ["ניקלודיאון"],
      image: "Assets/Content/Series/sponge.png",
      likes: 0
   },
   {
      title: "פיניאס ופרב",
      year: 2007,
      type: "סדרה",
      episodeLength: 20,
      genre: ["מצוייר", "ילדים"],
      origin: ["דיסני"],
      image: "Assets/Content/Series/PnP.png",
      likes: 0
   },
   {
      title: "גור ואוח",
      year: 2001,
      type: "סדרה",
      episodeLength: 25,
      genre: ["קומדיה"],
      origin: ["ג'טיקס"],
      image: "Assets/Content/Series/Gurveoach.png",
      likes: 0
   },
   {
      title: "זומזום",
      year: 2005,
      type: "סדרה",
      episodeLength: 25,
      genre: ["קומדיה"],
      origin: ["ערוץ הילדים", "יס"],
      image: "Assets/Content/Series/Zumzum.png",
      likes: 0
   },
   {
      title: "אדומות",
      year: 2004,
      type: "סדרה",
      episodeLength: 25,
      genre: ["דרמה"],
      origin: ["ערוץ הילדים"],
      image: "Assets/Content/Series/Adumot.png",
      likes: 0
   },
   {
      title: "שמש",
      year: 1997,
      type: "סדרה",
      episodeLength: 25,
      genre: ["קומדיה"],
      origin: ["ערוצים ישראלים"],
      image: "Assets/Content/Series/Shemesh.png",
      likes: 0
   },
   {
      title: "האלופה",
      year: 2006,
      type: "סדרה",
      episodeLength: 35,
      genre: ["טלנובלה"],
      origin: ["ערוצים ישראלים"],
      image: "Assets/Content/Series/Alufa.png",
      likes: 0
   },
   {
      title: "השועלים",
      year: 2010,
      type: "סדרה",
      episodeLength: 20,
      genre: ["קומדיה"],
      origin: ["yes", "ניקלודיאון"],
      image: "Assets/Content/Series/fox.png",
      likes: 0
   },
   {
      title: "לגעת באושר",
      year: 2001,
      type: "סדרה",
      episodeLength: 50,
      genre: ["טלנובלה"],
      origin: ["ויוה"],
      image: "Assets/Content/Series/osher.png",
      likes: 0
   },
   {
      title: "אליפים",
      year: 2010,
      type: "סדרה",
      episodeLength: 25,
      genre: [ "נוער", "דרמה"],
      origin: ["ערוץ הילדים", "yes"],
      image: "Assets/Content/Series/Alifim.png",
      likes: 0,
   },
   {
      title: "מתים לרגע",
      year: 2014,
      type: "סדרה",
      episodeLength: 30,
      genre: ["מדע בדיוני", "דרמה"],
      origin: ["hot"],
      image: "Assets/Content/Series/Metim.png",
      likes: 0
   },
   {
      title: "גאליס - קונקט",
      year: 2016,
      type: "סרט",
      duration: 98,
      genre: ["הרפתקאות", "פנטזיה", "נוער"],
      franchise: "גאליס",
      image: "Assets/Content/Movies/GalisConnect.png",
      likes: 0
   },  
   {
      title: "אח שלי הגדול",
      year: 2002,
      type: "סרט",
      duration: 32,
      genre: ["דרמה", "ילדים", "נוער", "צבא", "יום הזיכרון"],
      franchise: null,
      image: "Assets/Content/Movies/BigBro.png",
      likes: 0 
    }
];

const feedContainer = document.getElementById("feedContainer");

contentItems.forEach(function (item) {
  const card = document.createElement("div");
  card.className = "col-6 col-md-4 col-lg-3";
  card.innerHTML =`
   <article class="content-card"> 
    <img class="content-img" src="${item.image}" alt="${item.title}">
    <h3 class="content-title">${item.title}</h3>
    <p class="content-meta">${item.year}</p>
   </article> 
  `;
  feedContainer.appendChild(card);
});
