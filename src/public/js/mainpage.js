//_______________________________//
//         DOM ELEMENTS          //
//_______________________________//
const searchBox = document.querySelector(".search-box");
const searchToggle = document.getElementById("searchToggle");
const searchInput = document.getElementById("searchInput");
const categoryHeader= document.getElementById("categoryHeader");
const noHeroHeader= document.getElementById("noHeroHeader");
const heroSection = document.getElementById("heroSection");
const feedContainer = document.getElementById("feedContainer");
const profileImg = document.getElementById("profile");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.getElementById("logoutBtn");

const contentModal = new bootstrap.Modal(document.getElementById("contentScreenModal"));
const contentVideo = document.getElementById("contentVideo");
const videoPlayBtn = document.getElementById("videoPlayBtn");
const videoProgress = document.getElementById("videoProgress");
const videoCurrentTime = document.getElementById("videoCurrentTime");
const videoDuration = document.getElementById("videoDuration");
const videoMuteBtn = document.getElementById("videoMuteBtn");
const videoFullscreenBtn = document.getElementById("videoFullscreenBtn");
const videoWrap = document.getElementById("videoWrap");

// ADVANCED SEARCH #2
const advSearchToggle = document.getElementById("advSearchToggle");

// REVIEWS TAB
const reviewForm         = document.getElementById("reviewForm");
const reviewStars        = document.querySelectorAll("#reviewStars .star-btn");
const reviewText         = document.getElementById("reviewText");
const reviewSubmitBtn    = document.getElementById("reviewSubmitBtn");
const reviewFormMessage  = document.getElementById("reviewFormMessage");
const reviewCountAll     = document.getElementById("reviewCountAll");
const reviewCountMine    = document.getElementById("reviewCountMine");
const reviewAllToggle    = document.getElementById("reviewAllToggle");
const reviewMineToggle   = document.getElementById("reviewMineToggle");
const sortDateToggle     = document.getElementById("sortDateToggle");
const sortRatingToggle   = document.getElementById("sortRatingToggle");
const reviewsList        = document.getElementById("reviewsList");
const reviewsEmpty       = document.getElementById("reviewsEmpty");
const deleteReviewModal  = new bootstrap.Modal(document.getElementById("deleteReviewModal"));

//_______________________________//
//             STATE              //
//_______________________________//
let contentItems = [];
let activeProfileId = null;
let myProfileIds = [];   // ALL PROFILE IDs BELONGING TO THE LOGGED-IN USER (FOR "YOUR REVIEWS" FILTER)
let currentContentItem = null;
let sentMilestones = [];
let hasPlayed = false;
let continueItems = [];
let recommendedItems = [];
let likedItems = [];
let chosenCategory= null;
let resumeTo = 0;

// ADVANCED SEARCH #2
let advSearchFilters = [];   // { field, value, label } - ONE PER FIELD, AND'ED TOGETHER (SAME PATTERN AS admin-content activeFilters)

// DETAILS TAB - MAP + YOUTUBE
let mapsApiPromise = null;
let detailsLoadedForId = null;
let cachedYoutubeVideo = null;   // {videoId, title} FOR THE CURRENTLY LOADED ITEM, OR null IF NONE FOUND

// REVIEWS TAB
let reviewsLoadedForId = null;
let currentReviews = [];
let myReview = null;
let selectedRating = 0;
let reviewSort = "date";   // "date" (NEWEST FIRST, SERVER DEFAULT) OR "rating" (HIGHEST FIRST)
let showOnlyMine = false;  // "הביקורות שלכם" FILTER - LIMITS THE LIST TO THIS USER'S OWN PROFILES


//_______________________________//
//             API               //
//_______________________________//

//LOADS THE ACTIVE PROFILE'S NAME/IMAGE INTO THE HEADER
function loadActiveProfile(){
   fetch("/api/profiles/active")
   .then(res => res.json())
   .then(data => {
      if (data.success) {
         activeProfileId = data.profile._id;
         profileImg.onload = () => profileImg.classList.add("loaded");
         profileImg.src = data.profile.image;
         document.getElementById("activeProfileImg").src = data.profile.image;
         document.getElementById("activeProfileName").textContent = data.profile.name;
      }
   });
}

//LOADS ALL OF THE LOGGED-IN USER'S PROFILE IDs (NO RENDER) - USED FOR THE "YOUR REVIEWS" FILTER
function loadMyProfileIds(){
   return fetch("/api/profiles")
   .then(res => res.json())
   .then(data => { myProfileIds = data.success ? data.profile.map(p => p._id) : []; });
}

//LOADS ALL CONTENT INTO contentItems (NO RENDER)
function loadContent(){
   return fetch("/api/content")
   .then(res => res.json())
   .then(data => { contentItems = data.content; });
}

//LOADS THE ACTIVE PROFILE'S CONTINUE-WATCHING LIST INTO continueItems (NO RENDER)
function loadContinueWatching(){
   return fetch("/api/watch-history/continue")
   .then(res => res.json())
   .then(data => { continueItems = data.success ? data.history : []; });
}

//LOADS GENRE/FRANCHISE/ORIGIN-BASED RECOMMENDATIONS INTO recommendedItems (NO RENDER)
function loadRecommendations(){
   return fetch("/api/watch-history/recommendations")
   .then(res => res.json())
   .then(data => { recommendedItems = data.success ? data.content : []; });
}

//LOADS THE ACTIVE PROFILE'S LIKED CONTENT INTO likedItems (NO RENDER)
function loadLiked(){
   return fetch("/api/content/liked")
   .then(res => res.json())
   .then(data => { likedItems = data.success ? data.content : []; });
}

//INITIAL LOAD: FETCH BOTH, PICK A RANDOM HERO, RENDER THE FEED ONCE
function initFeed(){
   Promise.all([loadContent(), loadContinueWatching(), loadRecommendations(), loadLiked()]).then(() => {
      const featuredItem = contentItems[Math.floor(Math.random() * contentItems.length)];
      renderHero(featuredItem);
      renderFeed();
   });
}

//ENDS THE SESSION AND RETURNS TO LOGIN
function logout() {
    fetch("/api/auth/logout", { method: "POST" })
        .then(res => res.json())
        .then(() => {
            window.location.href = "/";
        });
}

// SAVES THE CURRENT WATCH PROGRESS FOR THE ACTIVE PROFILE
async function saveProgress(completed){
   if (!currentContentItem || !currentContentItem.videoUrl) return;
   if (!hasPlayed) return;   // opened/resumed but never actually played - don't bump the list
   if (!contentVideo.currentTime) return;   // nothing watched yet
   const isCompleted = completed || contentVideo.currentTime >= contentVideo.duration * 0.9;
   await fetch("/api/watch-history/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         contentId: currentContentItem._id,
         progress: contentVideo.currentTime,
         completed: isCompleted,
         duration: contentVideo.duration
      })
   });
}

//_______________________________//
//         DOM FUNCTIONS         //
//_______________________________//

//HERO SECTION (label CHANGES PER CATEGORY)
function renderHero(item, label = "במיוחד בשבילך") {
   heroSection.innerHTML= `
   <div class="hero-content">
      <div class="hero-text">
         <p class="hero-label">${label}</p>
         <div class="hero-heading">
            <h1 class="hero-title">${item.title}</h1>
            <span class="hero-details">${item.year} · ${item.genre[0]} · ${item.origin?.[0] || item.genre[1]}</span>
         </div>
         <p class="hero-desc">${item.description}</p>
         <button class="hero-btn" data-id="${item._id}">צפה עכשיו ▶</button>
      </div>
      <img class="hero-img" src="${item.image}" alt="${item.title}" data-id="${item._id}">
   </div>
   `;
}
//CARD RENDER
function renderCard(item) {
   return `
      <article class="content-card" data-id="${item._id}">
         <img class="content-img" src="${item.image}" alt="${item.title}">
         <h5 class="content-title">${item.title}</h5>
         <p class="content-details mb-1">${item.year} · ${item.genre[0]}</p>
      </article>
   `;
}

//SECTION RENDER
function renderSection(title, items){
   if(items.length===0) return "";
   return `
      <section class="content-section">
         <h4 class="section-title m-0">${title}</h4>
         <div class="section-wrapper">
            <button class="scroll-btn scroll-right" title="גלול ימינה">
               <i class="fa-solid fa-chevron-right"></i>
            </button>
            <div class="feed-row">
               ${items.map(renderCard).join("")}
            </div>
            <button class="scroll-btn scroll-left" title="גלול שמאלה">
               <i class="fa-solid fa-chevron-left"></i>
            </button>
         </div>
      </section>
   `;
}


//TOP10 CARD RENDER
function renderTopCard(item,index){
   return`
      <article class="top-card content-card" data-id="${item._id}">
         <span class="rank-number">${index + 1}</span>
         <img class="content-img" src="${item.image}" alt="${item.title}">
         <h5 class="content-title m-0">${item.title}</h5>
         <p class="content-details mb-1">${item.year} · ${item.genre[0]}</p>
      </article>
   `;
}
//TOP10 SECTION RENDER
function renderTopSection(items){
   return`
      <section class="content-section">
         <h4 class="section-title m-0">טופ 10 ברטרו סטרים:</h4>
         <div class="section-wrapper">
            <button class="scroll-btn scroll-right" title="גלול ימינה">
               <i class="fa-solid fa-chevron-right"></i>
            </button>
            <div class="feed-row top-feed-row">
               ${items.map((item, index) => renderTopCard(item, index)).join("")}
            </div>
            <button class="scroll-btn scroll-left" title="גלול שמאלה">
               <i class="fa-solid fa-chevron-left"></i>
            </button>
         </div>
      </section>
   `
}

//CONTINUE-WATCHING CARD (CARRIES data-progress SO THE MODAL CAN RESUME)
function renderContinueCard(record){
   const item = record.content;
   if (!item) return "";   // content was deleted
   const percent = record.duration ? (record.progress / record.duration) * 100 : 0;
   return `
      <article class="content-card continue-card" data-id="${item._id}" data-progress="${record.progress}" data-record-id="${record._id}">
         <button class="remove-card" title="הסר מהמשך צפייה"><i class="fa-solid fa-xmark"></i></button>
         <img class="content-img" src="${item.image}" alt="${item.title}">
         <div class="card-progress"><div class="card-progress-fill" style="width:${percent}%"></div></div>
         <h5 class="content-title">${item.title}</h5>
         <p class="content-details mb-1">${item.year} · ${item.genre[0]}</p>
      </article>
   `;
}


//CONTINUE-WATCHING SECTION
function renderContinueSection(records){
   if (records.length === 0) return "";
   return `
      <section class="content-section">
         <h4 class="section-title m-0">המשך צפייה</h4>
         <div class="section-wrapper">
            <button class="scroll-btn scroll-right" title="גלול ימינה">
               <i class="fa-solid fa-chevron-right"></i>
            </button>
            <div class="feed-row">
               ${records.map(renderContinueCard).join("")}
            </div>
            <button class="scroll-btn scroll-left" title="גלול שמאלה">
               <i class="fa-solid fa-chevron-left"></i>
            </button>
         </div>
      </section>
   `;
}

//FEED RENDER
function renderFeed(items = contentItems) {
   const top10 = [...contentItems].sort((a,b)=> (b.rating ?? 0) - (a.rating ?? 0)).slice(0,10); //allocate top 10 contents
   const sorted=[...contentItems].sort((a,b)=>a.title.localeCompare(b.title, 'he')); //allocate AB order
   feedContainer.innerHTML=`
      ${renderContinueSection(continueItems)}
      ${renderSection("מומלץ עבורך", recommendedItems)}
      ${likedItems.length >= 5 ? renderSection("כותרים שאהבת", likedItems) : ""}
      ${renderTopSection(top10)}
      ${renderSection("קומדיה", items.filter(item => item.genre.includes("קומדיה")))}
      ${renderSection("דרמה",items.filter(item=>item.genre.includes("דרמה")))}
      ${renderSection("צפייה קלילה", items.filter(item => item.type==="סדרה" && item.episodeLength<=25))}
      ${renderSection("סדר אלפבטי", sorted)}
   `;
}
//LIKE ANIMATION
function updateLikeUI(item){
   const btn = document.getElementById("likeBtn");
   const icon = btn.querySelector("i");
   const liked = item.likedBy?.includes(activeProfileId);
   icon.className = liked ? "fa-solid fa-heart" : "fa-regular fa-heart";
   btn.classList.toggle("liked", liked);
}

//SEARCH RESULTS RENDER
function renderSearchResults(items, searchText) {
   //clear any leftover category/mylist header from before the search started
   categoryHeader.innerHTML = "";
   noHeroHeader.innerHTML = "";
   //hide hero section
   heroSection.style.display = "none";
   //adaptable html content according to results/!results
   let innerContent;
   if (items.length===0){
      innerContent= `
         <div class="not-found">
            <i class="fa-solid fa-satellite-dish"></i>
            <h1> לא נמצאו תוצאות </h1>
            <i class="fa-solid fa-satellite-dish"></i>
         </div>`;
   } else{
      innerContent=`
         <div class="feed-row">
            ${items.map(renderCard).join("")}
         </div>`;
   }
   //HTML writing with adaptable content
   feedContainer.innerHTML = `
      <section class="content-section">
         <h2 class="section-title">תוצאות חיפוש עבור: ${searchText}</h2>
         ${innerContent}
      </section>`;
}

// FORMAT SECONDS AS m:ss
function formatTime(seconds){
   if (!isFinite(seconds)) return "0:00";
   const m = Math.floor(seconds / 60);
   const s = Math.floor(seconds % 60).toString().padStart(2, "0");
   return `${m}:${s}`;
}

// RESETS THE SEARCH-RELATED UI (LIVE SEARCH BOX + ADVANCED SEARCH TOGGLE) TO ITS DEFAULT STATE
// CALLED FROM BOTH goHome() AND THE NAVBAR CATEGORY LISTENER, SO IT'S A SHARED HELPER RATHER THAN DUPLICATED INLINE
function resetSearchUI(){
   searchBox.classList.remove("open");
   advSearchToggle.classList.remove("selected");
   advSearchToggle.classList.add("hidden");
   searchToggle.classList.remove("hidden");
}


//_______________________________//
//        CATEGORY MODE          //
//_______________________________//

// EACH CATEGORY = TITLE + HERO LABEL + BASE FILTER + ITS OWN ROW DEFINITIONS
// BUILT FRESH ON EVERY CALL SO STRINGS/FILTERS ALWAYS REFLECT THE CURRENT chosenCategory
function getCategories() {
   return {
   series: {
      title: "סדרות",
      heroLabel: "סדרה במיוחד בשבילך",
      filter: item => item.type === "סדרה",
      subFilterField: "genre",
      rows: [
         { title: "קומדיות שאסור לפספס", filter: item => item.genre.includes("קומדיה") },
         { title: "דרמות בשבילך",         filter: item => item.genre.includes("דרמה") },
         { title: "צפייה קלילה",          filter: item => item.episodeLength <= 25 },
         { title: "כל הסדרות א-ב",        filter: () => true, sort: (a,b) => a.title.localeCompare(b.title, 'he') }
      ]
   },
   movies: {
      title: "סרטים",
      heroLabel: "סרט במיוחד בשבילך",
      filter: item => item.type === "סרט",
      subFilterField: "genre",
      rows: [
         { title: "קומדיות קולנועיות", filter: item => item.genre.includes("קומדיה") },
         { title: "סרטי ילדות",         filter: item => item.genre.includes("ילדים") },
         { title: "כל הסרטים א-ב",      filter: () => true, sort: (a,b) => a.title.localeCompare(b.title, 'he') }
      ]
   },
   origin: {
      title: "ערוצים",
      heroLabel: `תכנים מערוצים`,
      filter: item => item.origin && item.origin.length > 0,
      subFilterField: "origin",
      rows: [
         {title: "קומדיות מערוצים", filter: item=>item.genre.includes("קומדיה") },
         {title: "מדע בדיוני מערוצים", filter: item=>item.genre.includes("מדע בדיוני")},
         {title: "כל התכנים מערוצים א-ב", filter: () => true, sort: (a,b) => a.title.localeCompare(b.title, 'he')}
      ]
   },
   nineties: {
      title: "שנות ה-90",
      heroLabel: "הילדות שלנו — שנות ה-90",
      filter: item => item.year < 2000,
      rows: [
         { title: "קומדיות שגידלו דור שלם", filter: item => item.genre.includes("קומדיה") },
         { title: "דרמות שנחרתו בזיכרון",   filter: item => item.genre.includes("דרמה") },
         { title: "כל הקלאסיקות של שנות ה-90 א-ב", filter: () => true, sort: (a,b) => a.title.localeCompare(b.title, 'he') }
      ]
   },
   y2000s: {
      title: "שנות ה-2000",
      heroLabel: "געגועים לשנות ה-2000",
      filter: item => item.year >= 2000 && item.year < 2010,
      rows: [
         { title: "קומדיות שכולנו מכירים בעל פה", filter: item => item.genre.includes("קומדיה") },
         { title: "דרמות שריגשו את כולם",         filter: item => item.genre.includes("דרמה") },
         { title: "כל התכנים משנות ה-2000 א-ב", filter: () => true, sort: (a,b) => a.title.localeCompare(b.title, 'he') }
      ]
   }
   };
}

// BUILDS THE CATEGORY HEADER: TITLE + (IF THE CATEGORY HAS ONE) A MULTI-COLUMN SUB-FILTER MENU BUILT FROM LIVE DATA
// THE MENU IS A CUSTOM DIV (NOT A NATIVE <select>) SO THE OPTION LIST CAN USE CSS3 column-count
function renderCategoryHeader(key){
   const category = getCategories()[key];
   noHeroHeader.innerHTML = ``;
   let dropdownHtml = "";
   if (category.subFilterField) {
      const baseItems = contentItems.filter(category.filter);
      const values = [...new Set(baseItems.flatMap(item => item[category.subFilterField] || []))].sort((a,b) => a.localeCompare(b, 'he'));
      const allLabel = "כל ה" + (key === "origin" ? "ערוצים" : "ז'אנרים");
      dropdownHtml = `
         <div class="sub-filter-dropdown" data-key="${key}">
            <button type="button" class="sub-filter-toggle">
               <span>${chosenCategory || allLabel}</span>
               <i class="fa-solid fa-caret-down"></i>
            </button>
            <div class="sub-filter-panel hidden">
               <a href="#" class="sub-filter-option ${!chosenCategory ? "active" : ""}" data-value="">${allLabel}</a>
               ${values.map(v => `<a href="#" class="sub-filter-option ${v === chosenCategory ? "active" : ""}" data-value="${v}">${v}</a>`).join("")}
            </div>
         </div>`;
   }
   categoryHeader.innerHTML = `<h2 class="category-title mb-0">${category.title}</h2>${dropdownHtml}`;
}

// RENDERS THE FEED IN CATEGORY MODE: CATEGORY HERO + THE CATEGORY'S OWN ROWS
function renderCategoryFeed(key){
   const category = getCategories()[key];
   const items = contentItems.filter(category.filter);
   renderCategoryHeader(key);
   heroSection.style.display = "block";
   renderHero(items[Math.floor(Math.random() * items.length)], category.heroLabel);
   feedContainer.innerHTML = `
      ${category.rows.map(row => {
         let rowItems = items.filter(row.filter);
         if (row.sort) rowItems = [...rowItems].sort(row.sort);
         return renderSection(row.title, rowItems);
      }).join("")}
   `;
}

// SECONDARY-FILTER VIEW (E.G. ONE GENRE/CHANNEL): FLAT GRID, NO HERO, categoryHeader STAYS VISIBLE
function renderSubFilteredGrid(key){
   const category = getCategories()[key];
   renderCategoryHeader(key);
   heroSection.style.display = "none";
   const baseItems = contentItems.filter(category.filter);
   const filtered = baseItems.filter(item => item[category.subFilterField]?.includes(chosenCategory));
   feedContainer.innerHTML = `
      <section class="content-section">
         <div class="feed-row">${filtered.map(renderCard).join("")}</div>
      </section>
   `;
}

// RETURNS TO THE DEFAULT HOME FEED (RANDOM HERO + FULL ROWS)
function goHome(){
   resetSearchUI();
   chosenCategory = null;
   categoryHeader.innerHTML= ``;
   noHeroHeader.innerHTML=``;
   heroSection.style.display = "block";
   renderHero(contentItems[Math.floor(Math.random() * contentItems.length)]);
   renderFeed();
}

// RENDERS "MY LIST": CONTINUE WATCHING + LIKED + TOP 10 - NO HERO
function renderMyList(){
   const top10 = [...contentItems].sort((a,b)=> (b.rating ?? 0) - (a.rating ?? 0)).slice(0,10);
   categoryHeader.innerHTML= ``;
   noHeroHeader.innerHTML = `<h2 class="category-title mb-0">הרשימה שלי</h2>`;
   heroSection.style.display = "none";
   feedContainer.innerHTML = `
      ${renderContinueSection(continueItems)}
      ${renderSection("כותרים שאהבת", likedItems)}
      ${renderTopSection(top10)}
   `;
}


//_______________________________//
//  ADVANCED SEARCH #2 - GENRE + DECADE + MIN RATING, FULL PAGE MODE (LIKE A CATEGORY), CHIP-BASED LIKE admin-content //
//_______________________________//
const advFieldLabels = { genre: "ז'אנר", origin:"ערוץ", decade: "עשור", minRating: "דירוג מינימלי" };

// BUILDS GENRE/DECADE <option>s FROM contentItems - NOT HARDCODED, SAME APPROACH AS THE NAVBAR SUB-FILTERS
function populateAdvSearchValueOptions(){
   const mode = document.getElementById("advSearchMode").value;
   const valueSelect = document.getElementById("advSearchValueSelect");
   if (mode === "genre") {
      const genres = [...new Set(contentItems.flatMap(item => item.genre || []))].sort((a,b) => a.localeCompare(b, 'he'));
      valueSelect.innerHTML = genres.map(g => `<option value="${g}">${g}</option>`).join("");
   } else if (mode === "origin") {
      const origins = [...new Set(contentItems.flatMap(item => item.origin || []))].sort((a,b) => a.localeCompare(b, 'he'));
      valueSelect.innerHTML = origins.map(o => `<option value="${o}">${o}</option>`).join("");
   } else if (mode === "decade") {
      const decades = [...new Set(contentItems.map(item => Math.floor(item.year / 10) * 10))].sort((a,b) => b - a);
      valueSelect.innerHTML = decades.map(d => `<option value="${d}">${d}-${d + 9}</option>`).join("");
   }
}

function renderAdvSearchChips(){
   document.getElementById("advSearchChips").innerHTML = advSearchFilters.map((f, i) => `
      <span class="filter-chip">
         ${f.label}: ${f.value}
         <button type="button" class="chip-remove" data-index="${i}">✕</button>
      </span>`).join("");
   document.getElementById("advSearchResetBtn").classList.toggle("hidden", advSearchFilters.length === 0);
}

// QUERIES /api/content/discover WITH THE ACCUMULATED FILTERS, RESULTS RENDER BELOW THE SEARCH ROW
function runAdvSearch(){
   const params = new URLSearchParams();
   advSearchFilters.forEach(f => params.set(f.field, f.value));
   fetch(`/api/content/discover?${params.toString()}`)
      .then(res => res.json())
      .then(data => renderAdvSearchResults(data.success ? data.content : []));
}

function renderAdvSearchResults(items){
   const grid = document.getElementById("advSearchResultsGrid");
   if (!grid) return;   // USER NAVIGATED AWAY BEFORE THE RESPONSE CAME BACK
   grid.innerHTML = items.length
      ? items.map(renderCard).join("")
      : `<p class="tab-placeholder">לא נמצאו תוצאות</p>`;
}


//_______________________________//
//     CONTENT MODAL - PLAYER    //
//_______________________________//

//FILLS THE CONTENT MODAL WITH ONE CONTENT ITEM'S DATA AND SHOWS IT
function openContentModal(id, progress){
   const item = contentItems.find(i => i._id === id);
   currentContentItem = item;
   sentMilestones = [];
   hasPlayed = false;
   resumeTo = Number(progress) || 0;
   videoWrap.classList.toggle("video-loading", resumeTo > 0);
   document.getElementById("modalTitle").textContent = item.title;
   document.getElementById("modalDetails").textContent = `${item.year} · ${item.type} · ${item.genre[0]}`;
   document.getElementById("modalDescription").textContent = item.description;
   const hasVideo = Boolean(item.videoUrl);
   contentVideo.src = item.videoUrl || "";
   videoWrap.classList.toggle("no-video", !hasVideo);
   videoPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
   videoProgress.value = 0;
   videoCurrentTime.textContent = "0:00";
   videoDuration.textContent = "0:00";
   updateLikeUI(item);
   switchContentTab("watch");
   contentModal.show();
}

// SWITCHES BETWEEN THE 3 CONTENT MODAL TABS (WATCH / REVIEWS / DETAILS)
// LEAVING THE WATCH TAB WHILE PLAYING MUST STOP THE VIDEO AND SAVE PROGRESS, SAME AS CLOSING THE MODAL
function switchContentTab(tab){
   const leavingWatch = document.getElementById("tabWatch").classList.contains("active") && tab !== "watch";
   if (leavingWatch && hasPlayed) {
      contentVideo.pause();
      saveProgress();
   }
   const leavingDetails = document.getElementById("tabDetails").classList.contains("active") && tab !== "details";
   if (leavingDetails) stopYoutubeClip();   // REMOVING THE IFRAME IS THE ONLY WAY TO STOP A YOUTUBE EMBED WITHOUT ITS JS API
   document.querySelectorAll(".content-tab-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
   document.querySelectorAll(".content-tab").forEach(section => section.classList.toggle("active", section.id === `tab${tab.charAt(0).toUpperCase()}${tab.slice(1)}`));
   if (tab === "details") loadDetailsTab(currentContentItem);
   if (tab === "reviews") { resetReviewControls(); loadReviewsTab(currentContentItem); }
}


//_______________________________//
//   DETAILS TAB - MAP + YOUTUBE //
//_______________________________//

// LOADS THE GOOGLE MAPS JS API ONCE, USING A KEY FETCHED FROM THE SERVER (STATIC HTML CAN'T READ .env)
function loadGoogleMapsApi(){
   if (!mapsApiPromise) {
      mapsApiPromise = fetch("/api/config/maps-key")
         .then(res => res.json())
         .then(data => new Promise((resolve, reject) => {
            window.__onGoogleMapsLoaded = resolve;
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.key}&loading=async&callback=__onGoogleMapsLoaded`;
            script.onerror = reject;
            document.head.appendChild(script);
         }));
   }
   return mapsApiPromise;
}

// GEOCODES item.filmingLocation AND DROPS A PIN, OR SHOWS "NO DATA" IF MISSING/NOT FOUND
function renderFilmingMap(item){
   const mapEl = document.getElementById("filmingMap");
   const emptyEl = document.getElementById("filmingMapEmpty");
   if (!item.filmingLocation) {
      mapEl.classList.add("hidden");
      emptyEl.classList.remove("hidden");
      return;
   }
   mapEl.classList.remove("hidden");
   emptyEl.classList.add("hidden");
   loadGoogleMapsApi().then(() => {
      new google.maps.Geocoder().geocode({ address: item.filmingLocation }, (results, status) => {
         if (status !== "OK" || !results[0]) {
            mapEl.classList.add("hidden");
            emptyEl.classList.remove("hidden");
            return;
         }
         const location = results[0].geometry.location;
         const map = new google.maps.Map(mapEl, { center: location, zoom: 12 });
         new google.maps.Marker({ position: location, map });
      });
   });
}

// REMOVES THE YOUTUBE IFRAME - THE ONLY WAY TO STOP AN EMBEDDED VIDEO WITHOUT ITS JS API
function stopYoutubeClip(){
   document.getElementById("youtubeClipWrap").innerHTML = "";
}

// INSERTS THE IFRAME FOR AN ALREADY-FETCHED VIDEO
function showYoutubeClip(video){
   document.getElementById("youtubeClipWrap").innerHTML =
      `<iframe src="https://www.youtube.com/embed/${video.videoId}" title="${video.title}" allowfullscreen></iframe>`;
}

// FETCHES A RELEVANT YOUTUBE CLIP FOR THIS CONTENT AND EMBEDS IT, OR SHOWS "NOT FOUND"
function renderYoutubeClip(item){
   const emptyEl = document.getElementById("youtubeClipEmpty");
   stopYoutubeClip();
   emptyEl.classList.add("hidden");
   fetch(`/api/content/${item._id}/youtube`)
      .then(res => res.json())
      .then(data => {
         if (!data.success || !data.video) { cachedYoutubeVideo = null; emptyEl.classList.remove("hidden"); return; }
         cachedYoutubeVideo = data.video;
         showYoutubeClip(data.video);
      })
      .catch(() => { cachedYoutubeVideo = null; emptyEl.classList.remove("hidden"); });
}

// LAZY-LOADS THE MAP + YOUTUBE CLIP THE FIRST TIME THE DETAILS TAB IS OPENED FOR THIS ITEM
// RETURNING TO THE TAB FOR THE SAME ITEM JUST RE-INSERTS THE CACHED CLIP INSTEAD OF RE-FETCHING
function loadDetailsTab(item){
   if (!item) return;
   if (detailsLoadedForId !== item._id) {
      detailsLoadedForId = item._id;
      renderFilmingMap(item);
      renderYoutubeClip(item);
   } else if (cachedYoutubeVideo) {
      showYoutubeClip(cachedYoutubeVideo);
   }
}


//_______________________________//
//   REVIEWS TAB - STARS + CRUD  //
//_______________________________//

// RESETS THE SORT/FILTER CONTROLS TO THEIR DEFAULTS - CALLED EVERY TIME THE TAB IS OPENED
function resetReviewControls(){
   reviewSort = "date";
   showOnlyMine = false;
   sortDateToggle.classList.add("active");
   sortRatingToggle.classList.remove("active");
   reviewAllToggle.classList.add("active");
   reviewMineToggle.classList.remove("active");
}

// LAZY-LOADS REVIEWS THE FIRST TIME THE TAB IS OPENED FOR THIS ITEM, RE-RENDERS (RESET CONTROLS) OTHERWISE
function loadReviewsTab(item){
   if (!item) return;
   if (reviewsLoadedForId !== item._id) {
      reviewsLoadedForId = item._id;
      fetchReviews(item);
   } else {
      renderReviewsList();
   }
}

// FETCHES ALL REVIEWS FOR THE ITEM AND RE-RENDERS THE FORM + LIST
function fetchReviews(item){
   fetch(`/api/reviews/content/${item._id}`)
      .then(res => res.json())
      .then(data => {
         currentReviews = data.success ? data.reviews : [];
         myReview = currentReviews.find(r => r.profile?._id === activeProfileId) || null;
         renderReviewForm();
         renderReviewsList();
      });
}

// PAINTS STARS 1..value AS FILLED (SOLID), THE REST AS OUTLINE
function paintStars(value){
   reviewStars.forEach(btn => {
      const filled = Number(btn.dataset.value) <= value;
      btn.classList.toggle("filled", filled);
      btn.querySelector("i").className = filled ? "fa-solid fa-star" : "fa-regular fa-star";
   });
}

// FILLS THE FORM WITH THE ACTIVE PROFILE'S EXISTING REVIEW, OR RESETS IT FOR A NEW ONE
function renderReviewForm(){
   reviewFormMessage.textContent = "";
   selectedRating = myReview ? myReview.rating : 0;
   paintStars(selectedRating);
   reviewText.value = myReview ? myReview.text : "";
   reviewSubmitBtn.textContent = myReview ? "עדכן ביקורת" : "פרסם ביקורת";
}

// RENDERS ALL REVIEWS FOR THE CONTENT, OWN REVIEW HIGHLIGHTED, FILTERED/SORTED PER showOnlyMine/reviewSort
function renderReviewsList(){
   const mineCount = currentReviews.filter(r => myProfileIds.includes(r.profile?._id)).length;
   reviewCountAll.textContent = currentReviews.length;
   reviewCountMine.textContent = mineCount;

   const filtered = showOnlyMine
      ? currentReviews.filter(r => myProfileIds.includes(r.profile?._id))
      : currentReviews;
   reviewsEmpty.classList.toggle("hidden", filtered.length > 0);
   const sorted = [...filtered].sort((a, b) =>
      reviewSort === "rating" ? b.rating - a.rating : new Date(b.createdAt) - new Date(a.createdAt)
   );
   reviewsList.innerHTML = sorted.map(reviewCardHtml).join("");
}

function reviewCardHtml(review){
   const isOwn = review.profile?._id === activeProfileId;
   const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
   const dateStr = new Date(review.createdAt).toLocaleDateString("he-IL");
   return `
      <div class="review-card${isOwn ? " own-review" : ""}">
         <div class="review-card-header">
            <span class="review-card-profile">
               ${review.profile?.image ? `<img src="/${review.profile.image}" alt="">` : ""}
               ${review.profile?.name || "פרופיל שנמחק"}
            </span>
            <span class="review-card-meta">
               <span class="review-card-date">${dateStr}</span>
               ${isOwn ? `<button type="button" class="review-delete-icon" data-review-id="${review._id}" title="מחק ביקורת"><i class="fa-solid fa-trash-can"></i></button>` : ""}
            </span>
         </div>
         <div class="review-card-stars">${stars}</div>
         ${review.text ? `<p class="review-card-text">${review.text}</p>` : ""}
      </div>`;
}


//_______________________________//
//        EVENT LISTENERS        //
//_______________________________//

initFeed();
loadActiveProfile();
loadMyProfileIds();

// NAVBAR CATEGORY CLICKS (home = default feed, the rest = category mode)
document.querySelectorAll(".nav-link[data-category]").forEach(link => {
   link.addEventListener("click", function(e){
      e.preventDefault();
      const key = link.dataset.category;
      resetSearchUI();
      chosenCategory = null;
      if (key === "home") return goHome();
      if (key === "mylist") return renderMyList();
      if (getCategories()[key]) renderCategoryFeed(key);   // channel-switching dropdown for origin not built yet
   });
});

// LOGO ALSO GOES HOME
document.getElementById("homeLink").addEventListener("click", function(e){
   e.preventDefault();
   goHome();
});

// TOGGLE PROFILE DROPDOWN
profileImg.addEventListener("click", function (e) {
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden");
});

// close dropdown when clicking outside
document.addEventListener("click", function () {
    profileDropdown.classList.add("hidden");
});

// OPEN/CLOSE SEARCH BOX
searchToggle.addEventListener("click", function () {
   if (searchBox.classList.contains("open")) {
      searchBox.classList.remove("open");
      advSearchToggle.classList.add("hidden");
      return
   }
   searchBox.classList.add("open");
   advSearchToggle.classList.remove("hidden");
});

//LIVE SEARCH - CLIENT SIDE
searchInput.addEventListener("input", function(){
   const searchText= searchInput.value.trim();
   if (searchText==="") {
     categoryHeader.innerHTML = "";
     noHeroHeader.innerHTML = "";
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

// RENDERS THE ADVANCED-SEARCH MODE INTO feedContainer, SAME PATTERN AS renderCategoryFeed/renderMyList
advSearchToggle.addEventListener("click", function(){
   if(advSearchToggle.classList.contains("selected")){
      goHome();
      return
   }
   searchBox.classList.remove("open");
   searchToggle.classList.add("hidden");
   advSearchToggle.classList.add("selected");
   chosenCategory = null;
   advSearchFilters = [];
   heroSection.style.display = "none";
   categoryHeader.innerHTML = "";
   noHeroHeader.innerHTML = `<h1 class="category-title mb-0">חיפוש מתקדם</h1>`;
   feedContainer.innerHTML = `
      <div class="adv-search-row d-flex flex-column gap-2 mb-3">
         <div class="d-flex align-items-center gap-3 flex-wrap">
            <label for="advSearchMode" class="searchModeLabel">חפש לפי:</label>
            <select id="advSearchMode" class="searchSelect">
               <option value="genre">ז'אנר</option>
               <option value="origin">ערוץ</option>
               <option value="decade">עשור</option>
               <option value="minRating">דירוג מינימלי</option>
            </select>
            <button type="button" id="advSearchResetBtn" class="searchRowBtn hidden d-flex align-items-center gap-2">אפס חיפוש<i class="fa-solid fa-filter-circle-xmark"></i></button>
         </div>
         <div class="d-flex flex-wrap gap-2 align-items-center">
            <select id="advSearchValueSelect" class="searchInput"></select>
            <input type="number" id="advSearchValueNumber" class="searchInput hidden" min="0" max="10" step="0.5" placeholder="0-10" />
            <button type="button" id="advSearchAddBtn" class="searchRowBtn d-flex align-items-center gap-2">חפש<i class="fa-solid fa-magnifying-glass"></i></button>
            <p id="advSearchMessage" class="adv-search-message"></p>
         </div>
         <div id="advSearchChips" class="d-flex flex-wrap gap-2"></div>
      </div>
      <section class="content-section">
         <div id="advSearchResultsGrid" class="feed-row"></div>
      </section>
   `;
   populateAdvSearchValueOptions();
});

// SWAPS THE VALUE INPUT BETWEEN A <select> (GENRE/DECADE) AND A NUMBER INPUT (MIN RATING)
// DELEGATED BECAUSE THE ROW IS REBUILT EVERY TIME advSearchToggle IS CLICKED
document.addEventListener("change", function(e){
   if (e.target.id !== "advSearchMode") return;
   const isRating = e.target.value === "minRating";
   document.getElementById("advSearchValueSelect").classList.toggle("hidden", isRating);
   document.getElementById("advSearchValueNumber").classList.toggle("hidden", !isRating);
   populateAdvSearchValueOptions();
});

// ADD CHIP / RESET / REMOVE CHIP - ALL DELEGATED (SAME REASON AS ABOVE)
document.addEventListener("click", function(e){
   if (e.target.closest("#advSearchAddBtn")) {
      const mode = document.getElementById("advSearchMode");
      const field = mode.value;
      const valueNumber = document.getElementById("advSearchValueNumber");
      const value = field === "minRating" ? valueNumber.value.trim() : document.getElementById("advSearchValueSelect").value;
      const message = document.getElementById("advSearchMessage");
      if (!value) { message.textContent = "נא לבחור ערך"; return; }
      message.textContent = "";
      advSearchFilters = advSearchFilters.filter(f => f.field !== field);
      advSearchFilters.push({ field, value, label: advFieldLabels[field] });
      valueNumber.value = "";
      renderAdvSearchChips();
      runAdvSearch();
      return;
   }

   if (e.target.closest("#advSearchResetBtn")) {
      advSearchFilters = [];
      renderAdvSearchChips();
      document.getElementById("advSearchResultsGrid").innerHTML = "";
      return;
   }

   const removeBtn = e.target.closest("#advSearchChips .chip-remove");
   if (removeBtn) {
      advSearchFilters.splice(Number(removeBtn.dataset.index), 1);
      renderAdvSearchChips();
      if (advSearchFilters.length) runAdvSearch();
      else document.getElementById("advSearchResultsGrid").innerHTML = "";
   }
});

//SCROLL FUNCTION
document.addEventListener("click", function(e) {
   //is scroll button?
   const btn = e.target.closest(".scroll-btn");
   if(!btn) return;
   //
   const row= btn.parentElement.querySelector(".feed-row");
   const direction = btn.classList.contains("scroll-right") ? 500 : -500; //if right scroll -330, else 330
   row.scrollBy({left: direction, behavior:"smooth"});
});

// SUB-FILTER DROPDOWN (GENRE/CHANNEL MULTI-COLUMN MENU): TOGGLE OPEN, PICK A VALUE, CLOSE ON OUTSIDE CLICK
// DELEGATED (NOT ATTACHED INSIDE renderCategoryHeader) BECAUSE THE PANEL IS REBUILT ON EVERY RENDER
document.addEventListener("click", function(e){
   const toggle = e.target.closest(".sub-filter-toggle");
   if (toggle) {
      toggle.nextElementSibling.classList.toggle("hidden");
      return;
   }

   const option = e.target.closest(".sub-filter-option");
   if (option) {
      e.preventDefault();
      const key = option.closest(".sub-filter-dropdown").dataset.key;
      chosenCategory = option.dataset.value || null;
      if (chosenCategory) renderSubFilteredGrid(key);
      else renderCategoryFeed(key);
      return;
   }

   // clicked elsewhere - close any open panel
   document.querySelectorAll(".sub-filter-panel").forEach(p => p.classList.add("hidden"));
});

// OPEN CONTENT MODAL
document.addEventListener("click", function(e){
   if (e.target.closest(".remove-card")) return;   // X button is handled separately
   const trigger = e.target.closest(".content-card, .hero-btn, .hero-img");
   if (!trigger) return;
   openContentModal(trigger.dataset.id, trigger.dataset.progress);
});

// REMOVE A CONTENT FROM THE CONTINUE-WATCHING ROW
document.addEventListener("click", async function(e){
   const removeBtn = e.target.closest(".remove-card");
   if (!removeBtn) return;
   const card = removeBtn.closest(".continue-card");
   const recordId = card.dataset.recordId;
   await fetch(`/api/watch-history/${recordId}`, { method: "DELETE" });
   continueItems = continueItems.filter(r => r._id !== recordId);
   renderFeed();
});

// CONTENT MODAL TAB BUTTONS
document.querySelectorAll(".content-tab-btn").forEach(btn => {
   btn.addEventListener("click", () => switchContentTab(btn.dataset.tab));
});

// REVIEWS TAB - STAR PICKER (CLICK TO SELECT, HOVER TO PREVIEW)
reviewStars.forEach(btn => {
   btn.addEventListener("click", () => {
      selectedRating = Number(btn.dataset.value);
      paintStars(selectedRating);
   });
   btn.addEventListener("mouseenter", () => paintStars(Number(btn.dataset.value)));
});
document.getElementById("reviewStars").addEventListener("mouseleave", () => paintStars(selectedRating));

// REVIEWS TAB - SWITCHES THE SORT MODE FOR THE REVIEWS LIST
sortDateToggle.addEventListener("click", function(){
   reviewSort = "date";
   sortDateToggle.classList.add("active");
   sortRatingToggle.classList.remove("active");
   renderReviewsList();
});
sortRatingToggle.addEventListener("click", function(){
   reviewSort = "rating";
   sortRatingToggle.classList.add("active");
   sortDateToggle.classList.remove("active");
   renderReviewsList();
});

// REVIEWS TAB - SWITCHES BETWEEN "כל הביקורות" AND "הביקורות שלכם" (ALL PROFILES UNDER THE LOGGED-IN USER, NOT JUST THE ACTIVE ONE)
reviewAllToggle.addEventListener("click", function(){
   showOnlyMine = false;
   reviewAllToggle.classList.add("active");
   reviewMineToggle.classList.remove("active");
   renderReviewsList();
});
reviewMineToggle.addEventListener("click", function(){
   showOnlyMine = true;
   reviewMineToggle.classList.add("active");
   reviewAllToggle.classList.remove("active");
   renderReviewsList();
});

// REVIEWS TAB - SUBMIT: CREATES A NEW REVIEW, OR UPDATES THE ACTIVE PROFILE'S EXISTING ONE
reviewForm.addEventListener("submit", function(e){
   e.preventDefault();
   if (!selectedRating) { reviewFormMessage.textContent = "נא לבחור דירוג"; return; }
   const body = { rating: selectedRating, text: reviewText.value.trim() };
   const isEdit = Boolean(myReview);
   const url = isEdit ? `/api/reviews/${myReview._id}` : `/api/reviews/content/${currentContentItem._id}`;
   const method = isEdit ? "PUT" : "POST";

   fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
   })
   .then(res => res.json())
   .then(data => {
      if (!data.success) { reviewFormMessage.textContent = data.message; return; }
      fetchReviews(currentContentItem);
   });
});

// REVIEWS TAB - DELETE FLOW: CLICKING THE TRASH ICON ON YOUR OWN REVIEW CARD OPENS THE CONFIRMATION MODAL
reviewsList.addEventListener("click", function(e){
   if (e.target.closest(".review-delete-icon")) deleteReviewModal.show();
});
document.getElementById("confirmDeleteReview").addEventListener("click", function(){
   if (!myReview) return;
   fetch(`/api/reviews/${myReview._id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(data => {
         deleteReviewModal.hide();
         if (data.success) fetchReviews(currentContentItem);
      });
});

// LIKE BUTTON (IN MODAL) - PERSISTED, OPTIMISTIC UPDATE
document.getElementById("likeBtn").addEventListener("click", function(){
   const item = currentContentItem;
   const wasLiked = item.likedBy?.includes(activeProfileId);

   item.likedBy = item.likedBy || [];
   if (wasLiked) item.likedBy = item.likedBy.filter(id => id !== activeProfileId);
   else item.likedBy.push(activeProfileId);
   updateLikeUI(item);

   fetch(`/api/content/${item._id}/like`, { method: "PUT" })
      .then(res => res.json())
      .then(data => {
         if (data.success) return;
         if (wasLiked) item.likedBy.push(activeProfileId);
         else item.likedBy = item.likedBy.filter(id => id !== activeProfileId);
         updateLikeUI(item);
      });
});

// LOGOUT
logoutBtn.addEventListener("click", logout);

// CUSTOM VIDEO CONTROLS

// PLAY/PAUSE BUTTON TOGGLES PLAYBACK
videoPlayBtn.addEventListener("click", function(){
   if (contentVideo.paused) contentVideo.play();
   else contentVideo.pause();
});

// SWAPS THE PLAY ICON TO PAUSE WHEN PLAYBACK STARTS
contentVideo.addEventListener("play", () => {
   videoPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
   hasPlayed = true;
});
// SWAPS THE ICON BACK TO PLAY WHEN PLAYBACK STOPS
contentVideo.addEventListener("pause", () => {
   videoPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
   saveProgress();
});

// SHOWS THE TOTAL DURATION ONCE THE VIDEO METADATA IS KNOWN
contentVideo.addEventListener("loadedmetadata", () => {
   videoDuration.textContent = formatTime(contentVideo.duration);
   if (resumeTo) {
      contentVideo.currentTime = resumeTo;
      resumeTo = 0;
      videoProgress.value = (contentVideo.currentTime / contentVideo.duration) * 100 || 0;
      videoCurrentTime.textContent = formatTime(contentVideo.currentTime);
   }
   videoWrap.classList.remove("video-loading");   // position is ready - reveal controls
});

// KEEPS THE CURRENT TIME AND PROGRESS BAR IN SYNC WHILE PLAYING
contentVideo.addEventListener("timeupdate", () => {
   const progressPercent = (contentVideo.currentTime / contentVideo.duration) * 100;

   videoCurrentTime.textContent = formatTime(contentVideo.currentTime);
   videoProgress.value = (progressPercent || 0);

   [25, 50, 75].forEach(m => {
      if (progressPercent >= m && !sentMilestones.includes(m)) {
         sentMilestones.push(m);
         saveProgress();
      }
   });
});

// SAVE AS COMPLETED WHEN THE VIDEO FINISHES
contentVideo.addEventListener("ended", () => saveProgress(true));

// DRAGGING THE PROGRESS BAR SEEKS THE VIDEO
videoProgress.addEventListener("input", function(){
   contentVideo.currentTime = (videoProgress.value / 100) * contentVideo.duration;
});

// MUTE BUTTON TOGGLES SOUND AND SWAPS THE ICON
videoMuteBtn.addEventListener("click", function(){
   contentVideo.muted = !contentVideo.muted;
   videoMuteBtn.innerHTML = contentVideo.muted
      ? '<i class="fa-solid fa-volume-xmark"></i>'
      : '<i class="fa-solid fa-volume-high"></i>';
});

// FULLSCREEN BUTTON TOGGLES FULLSCREEN ON THE WHOLE VIDEO WRAPPER (INCLUDES CONTROLS)
videoFullscreenBtn.addEventListener("click", function(){
   if (document.fullscreenElement) {
      document.exitFullscreen();
   } else {
      videoWrap.requestFullscreen();
   }
});

// DROPS FOCUS FROM THE CLOSE BUTTON BEFORE BOOTSTRAP MARKS THE MODAL aria-hidden, AVOIDING A CONSOLE A11Y WARNING
document.getElementById("contentScreenModal").addEventListener("hide.bs.modal", function(){
   document.activeElement?.blur();
});

// STOP PLAYBACK + RESET ALL TAB STATE WHEN THE MODAL CLOSES
document.getElementById("contentScreenModal").addEventListener("hidden.bs.modal", function(){
   if (hasPlayed) {
      saveProgress().then(() => loadContinueWatching()).then(renderFeed);   // save first, then refresh the row
   }
   stopYoutubeClip();
   detailsLoadedForId = null;
   cachedYoutubeVideo = null;
   reviewsLoadedForId = null;
   currentReviews = [];
   myReview = null;
   contentVideo.pause();
   contentVideo.currentTime = 0;
});
