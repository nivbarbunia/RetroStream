//_______________________________//
//         DOM ELEMENTS          //
//_______________________________//
const searchBox = document.querySelector(".search-box");
const searchToggle = document.getElementById("searchToggle");
const searchInput = document.getElementById("searchInput");
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

let contentItems = [];
let activeProfileId = null;
let currentContentItem = null;
let sentMilestones = [];
let hasPlayed = false;
let continueItems = [];
let recommendedItems = [];
let likedItems = [];
let chosenCategory= null;
let resumeTo = 0;


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
            <button class="scroll-btn scroll-right title="גלול ימינה"">
               <i class="fa-solid fa-chevron-right"></i>
            </button>
            <div class="feed-row">
               ${records.map(renderContinueCard).join("")}
            </div>
            <button class="scroll-btn scroll-left title="גלול שמאלה"">
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

//_______________________________//
//        CATEGORY MODE          //
//_______________________________//

// EACH CATEGORY = TITLE + HERO LABEL + BASE FILTER + ITS OWN ROW DEFINITIONS
const categories = {
   series: {
      title: "סדרות",
      heroLabel: "סדרה במיוחד בשבילך",
      filter: item => item.type === "סדרה",
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
      rows: [
         { title: "קומדיות קולנועיות", filter: item => item.genre.includes("קומדיה") },
         { title: "סרטי ילדות",         filter: item => item.genre.includes("ילדים") },
         { title: "כל הסרטים א-ב",      filter: () => true, sort: (a,b) => a.title.localeCompare(b.title, 'he') }
      ]
   },
   origin: {
      title: chosenCategory || "ערוץ הילדים",
      heroLabel: "מומלץ מהערוץ",
      filter: item =>  item.origin.includes(chosenCategory || "ערוץ הילדים"),
      rows: [
         {title: "קומדיות מבית " + (chosenCategory || "ערוץ הילדים"), filter: item=>item.genre.includes("קומדיה") },
         {title: "מדע בדיוני מבית " + (chosenCategory || "ערוץ הילדים"), filter: item=>item.genre.includes("מדע בדיוני")},
         {title: "כל התכנים מהערוץ א-ב", filter: () => true, sort: (a,b) => a.title.localeCompare(b.title, 'he')}
      ]
   },
   decade: { 
      title: "שנות ה-" + (chosenCategory || "2010"),
      heroLabel: "קלאסיקה משנות ה-" + (chosenCategory || "2010"),
      filter: item => 
      Number(chosenCategory || "2010") === 2010 ? item.year>2009: 
      Number(chosenCategory || "2010") === 2000 ? item.year>1999 && item.year<2010: item.year<2000 , 
      rows: [
         {title: "קומדיות " + (chosenCategory || "2010")+"s", filter: item=>item.genre.includes("קומדיה") },
         {title: "דרמות " + (chosenCategory || "2010") + "s", filter: item=>item.genre.includes("מדע בדיוני")},
         {title: "כל תכני העשור א-ב", filter: () => true, sort: (a,b) => a.title.localeCompare(b.title, 'he')}
      ] 
   }
};

// RENDERS THE FEED IN CATEGORY MODE: CATEGORY HERO + THE CATEGORY'S OWN ROWS
function renderCategoryFeed(key){
   const category = categories[key];
   const items = contentItems.filter(category.filter);
   categoryHeader.innerHTML = `<h2 class="category-title mb-0">${category.title}</h2>`;
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

// RETURNS TO THE DEFAULT HOME FEED (RANDOM HERO + FULL ROWS)
function goHome(){
   categoryHeader.innerHTML= ``;
   heroSection.style.display = "block";
   renderHero(contentItems[Math.floor(Math.random() * contentItems.length)]);
   renderFeed();
}

//SEARCH RESULTS RENDER
function renderSearchResults(items, searchText) {
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
//LIKE ANIMATION
function updateLikeUI(item){
   const btn = document.getElementById("likeBtn");
   const icon = btn.querySelector("i");
   const liked = item.likedBy?.includes(activeProfileId);
   icon.className = liked ? "fa-solid fa-heart" : "fa-regular fa-heart";
   btn.classList.toggle("liked", liked);
}


//_______________________________//
//        EVENT LISTENERS        //
//_______________________________//


initFeed();
loadActiveProfile();

// NAVBAR CATEGORY CLICKS (home = default feed, the rest = category mode)
document.querySelectorAll(".nav-link[data-category]").forEach(link => {
   link.addEventListener("click", function(e){
      e.preventDefault();
      const key = link.dataset.category;
      if (key === "home") return goHome();
      if (categories[key]) renderCategoryFeed(key);   // unwired categories (channels/decades/mylist) do nothing yet
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

// OPEN SEARCH BOX
searchToggle.addEventListener("click", function () {
   searchBox.classList.add("open");
   if (searchBox.classList.contains("open")) {
      searchInput.focus();
   }
});

// CLOSE SEARCH BOX
searchInput.addEventListener("blur", function () {
   searchBox.classList.remove("open");
});

//LIVE SEARCH - CLIENT SIDE
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
   contentModal.show();
}

// FORMAT SECONDS AS m:ss
function formatTime(seconds){
   if (!isFinite(seconds)) return "0:00";
   const m = Math.floor(seconds / 60);
   const s = Math.floor(seconds % 60).toString().padStart(2, "0");
   return `${m}:${s}`;
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

// STOP PLAYBACK WHEN THE MODAL CLOSES
document.getElementById("contentScreenModal").addEventListener("hidden.bs.modal", function(){
   if (hasPlayed) {
      saveProgress().then(() => loadContinueWatching()).then(renderFeed);   // save first, then refresh the row
   }
   contentVideo.pause();
   contentVideo.currentTime = 0;
});