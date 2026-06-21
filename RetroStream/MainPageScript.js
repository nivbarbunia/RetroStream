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
      description:"כשאסון עולמי מאיים להשמיד את האנושות, חבורת צעירים מוצאת את עצמה במרכזה של מזימה חוצת זמנים. האם ניתן לשנות את העתיד?",
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
      description:"ארבעה חברים רווקים המתגוררים בלב תל אביב מנסים לנווט בין מערכות יחסים, עבודה וחיי היומיום. בכל פרק הם נקלעים לסיטואציות חדשות, מסתבכים בדרכים לא צפויות ונעזרים זה בזה כדי להתמודד עם האבומינציה שהיא: תל אביב.",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
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
      description:"",
      image: "Assets/Content/Series/osher.png",
      liked: false,
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
      description:"",
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
      description:"",
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
      description:"",
      image: "Assets/Content/Movies/BigBro.png",
      liked: false,
      likes: 30
       
    }
];

const sorted=[...contentItems].sort((a,b)=>a.title.localeCompare(b.title, 'he'));
const heroSection = document.getElementById("heroSection");
const featuredItem =  contentItems[Math.floor(Math.random() * contentItems.length)];

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
//FUNCTIONS
//CARD RENDER
function renderCard(item) {
   return `
      <article class="content-card">
         <img class="content-img" src="${item.image}" alt="${item.title}">
         <h3 class="content-title">${item.title}</h3>
         <p class="content-details">${item.year} · ${item.genre[0]}</p>
         <div class="like-section">
            <button class="like-btn" data-title="${item.title}">
               <i class="fa-regular fa-heart"></i>
            </button>
            <span>${item.likes}</span>
         </div>      
    </article>
   `;
}
//SECTION RENDER
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
//TOP10 CARD RENDER
function renderTopCard(item,index){
   return`
      <article class="top-card content-card">
         <span class="rank-number">${index + 1}</span>
         <img class="content-img" src="${item.image}" alt="${item.title}">
         <h3 class="content-title">${item.title}</h3>
         <p class="content-details">${item.year} · ${item.genre[0]}</p>
      </article>
   `;
}
//TOP10 SECTION RENDER
function renderTopSection(items){
   return`
      <section class="content-section">
         <h2 class="section-title">טופ 10 ברטרו סטרים:</h2>
         <div class="feed-row top-feed-row">
            ${items.map((item, index) => renderTopCard(item, index)).join("")}
         </div>
      </section>
   `
}

//FEED RENDER
function renderFeed(items = contentItems) {
   const top10 = [...contentItems].sort((a,b)=> b.likes - a.likes).slice(0,10); //allocate top 10 contents
   feedContainer.innerHTML=`
      ${renderSection("המשך צפייה", items.slice(0,5))}
      ${renderTopSection(top10)}
      ${renderSection("קומדיה", items.filter(item => item.genre.includes("קומדיה")))}
      ${renderSection("דרמה",items.filter(item=>item.genre.includes("דרמה")))}
      ${renderSection("צפייה קלילה", items.filter(item => item.type==="סדרה" && item.episodeLength<=25))}
      ${renderSection("סדר אלפבטי", sorted)}
   `;
}

//SEARCH RENDER
function renderSearchResults(items, searchText) {
   heroSection.style.display = "none";
   feedContainer.innerHTML = `
      <section class="content-section">
         <h2 class="section-title">תוצאות חיפוש עבור: ${searchText}</h2>
         <div class="feed-row">
            ${items.map(renderCard).join("")}
         </div>
      </section>
   `;
   //No Results section
   if(items.length===0){
      feedContainer.innerHTML = `
      <section class="content-section">
         <h2 class="section-title">תוצאות חיפוש עבור: ${searchText}</h2>
            <div class="not-found">
            <i class="fa-solid fa-satellite-dish"></i>
            <h1> לא נמצאו תוצאות </h1>
            <i class="fa-solid fa-satellite-dish"></i>
            </div>
      </section>
   `;
   }
}


//event listeners
//search function
searchInput.addEventListener("input", function(){
   const searchText= searchInput.value.trim();
   if (searchText==="") {
     heroSection.style.display ="block";
     renderFeed();
     return;
   }
   const filteredItems = contentItems.filter(item=>
      item.title.includes(searchText) ||
      item.genre.some(genre=>genre.includes(searchText)) ||
      item.origin?.some(origin=> origin.includes(searchText))
   );
   renderSearchResults(filteredItems, searchText);
});
//like function
document.addEventListener("click", function(e){
   const btn = e.target.closest(".like-btn");
   if (!btn) return;
   
   const title = btn.dataset.title;
   const item= contentItems.find(i=> i.title===title);
   const icon = btn.querySelector("i");
   const span = btn.nextElementSibling;

   item.liked = !item.liked;
   item.likes += item.liked? 1:-1;
   icon.className = item.liked ? "fa-solid fa-heart" : "fa-regular fa-heart";
   btn.classList.toggle("liked");
   span.textContent = item.likes;
   
});

renderFeed();



