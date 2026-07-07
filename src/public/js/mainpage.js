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

let contentItems = [];
let activeProfileId = null;
let currentDetailsItem = null;
const detailsModal = new bootstrap.Modal(document.getElementById("contentDetailsModal"));
const detailsVideo = document.getElementById("detailsVideo");
const videoPlayBtn = document.getElementById("videoPlayBtn");
const videoProgress = document.getElementById("videoProgress");
const videoCurrentTime = document.getElementById("videoCurrentTime");
const videoDuration = document.getElementById("videoDuration");
const videoMuteBtn = document.getElementById("videoMuteBtn");
const videoFullscreenBtn = document.getElementById("videoFullscreenBtn");
const detailsVideoWrap = document.getElementById("detailsVideoWrap");

//_______________________________//
//             API               //
//_______________________________//

//LOADS ALL CONTENT, PICKS A RANDOM HERO ITEM, RENDERS THE FEED
function loadContent(){
   fetch("/api/content")
   .then(res => res.json())
   .then(data => {
      contentItems = data.content;
      const featuredItem =  contentItems[Math.floor(Math.random() * contentItems.length)];
      renderHero(featuredItem);
      renderFeed(contentItems);
   });
}

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

//HERO SECTION
function renderHero(item) {
   heroSection.innerHTML= `
   <div class="hero-content">
      <div class="hero-text">
         <p class="hero-label">במיוחד בשבילך</p>
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
         <h3 class="content-title">${item.title}</h3>
         <p class="content-details">${item.year} · ${item.genre[0]}</p>
    </article>
   `;
}

//SECTION RENDER
function renderSection(title, items){
   if(items.length===0) return "";
   return `
      <section class="content-section">
         <h2 class="section-title">${title}</h2>
         <div class="section-wrapper">
            <button class="scroll-btn scroll-right">
               <i class="fa-solid fa-chevron-right"></i>
            </button>    
            <div class="feed-row"> 
               ${items.map(renderCard).join("")}
            </div>
            <button class="scroll-btn scroll-left">
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
         <div class="section-wrapper">
            <button class="scroll-btn scroll-right">
               <i class="fa-solid fa-chevron-right"></i>
            </button>    
            <div class="feed-row top-feed-row">
               ${items.map((item, index) => renderTopCard(item, index)).join("")}
            </div>
            <button class="scroll-btn scroll-left">
               <i class="fa-solid fa-chevron-left"></i>
            </button>
         </div>
      </section>
   `
}

//FEED RENDER
function renderFeed(items = contentItems) {
   const top10 = [...contentItems].sort((a,b)=> (b.rating ?? 0) - (a.rating ?? 0)).slice(0,10); //allocate top 10 contents
   const sorted=[...contentItems].sort((a,b)=>a.title.localeCompare(b.title, 'he'));
   feedContainer.innerHTML=`
      ${renderSection("המשך צפייה", items.slice(0,5))}
      ${renderTopSection(top10)}
      ${renderSection("קומדיה", items.filter(item => item.genre.includes("קומדיה")))}
      ${renderSection("דרמה",items.filter(item=>item.genre.includes("דרמה")))}
      ${renderSection("צפייה קלילה", items.filter(item => item.type==="סדרה" && item.episodeLength<=25))}
      ${renderSection("סדר אלפבטי", sorted)}
   `;
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
   const btn = document.getElementById("detailsLikeBtn");
   const icon = btn.querySelector("i");
   const liked = item.likedBy?.includes(activeProfileId);
   icon.className = liked ? "fa-solid fa-heart" : "fa-regular fa-heart";
   btn.classList.toggle("liked", liked);
}


//_______________________________//
//        EVENT LISTENERS        //
//_______________________________//


loadContent();
loadActiveProfile();

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
   const direction = btn.classList.contains("scroll-right") ? 330 : -330; //if right scroll -330, else 330
   row.scrollBy({left: direction, behavior:"smooth"});
});


// OPEN CONTENT DETAILS MODAL
document.addEventListener("click", function(e){
   const trigger = e.target.closest(".content-card, .hero-btn, .hero-img");
   if (!trigger) return;
   openDetailsModal(trigger.dataset.id);
});

//FILLS THE DETAILS MODAL WITH ONE CONTENT ITEM'S DATA AND SHOWS IT
function openDetailsModal(id){
   const item = contentItems.find(i => i._id === id);
   currentDetailsItem = item;
   document.getElementById("detailsTitle").textContent = item.title;
   document.getElementById("detailsMeta").textContent = `${item.year} · ${item.type} · ${item.genre[0]}`;
   document.getElementById("detailsDescription").textContent = item.description;
   const hasVideo = Boolean(item.videoUrl);
   detailsVideo.src = item.videoUrl || "";
   detailsVideoWrap.classList.toggle("no-video", !hasVideo);
   videoPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
   videoProgress.value = 0;
   videoCurrentTime.textContent = "0:00";
   videoDuration.textContent = "0:00";
   updateLikeUI(item);
   detailsModal.show();
}

// FORMAT SECONDS AS m:ss
function formatTime(seconds){
   if (!isFinite(seconds)) return "0:00";
   const m = Math.floor(seconds / 60);
   const s = Math.floor(seconds % 60).toString().padStart(2, "0");
   return `${m}:${s}`;
}


// LIKE BUTTON (IN MODAL) - PERSISTED, OPTIMISTIC UPDATE
document.getElementById("detailsLikeBtn").addEventListener("click", function(){
   const item = currentDetailsItem;
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
   if (detailsVideo.paused) detailsVideo.play();
   else detailsVideo.pause();
});

// SWAPS THE PLAY ICON TO PAUSE WHEN PLAYBACK STARTS
detailsVideo.addEventListener("play", () => {
   videoPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
});
// SWAPS THE ICON BACK TO PLAY WHEN PLAYBACK STOPS
detailsVideo.addEventListener("pause", () => {
   videoPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
});

// SHOWS THE TOTAL DURATION ONCE THE VIDEO METADATA IS KNOWN
detailsVideo.addEventListener("loadedmetadata", () => {
   videoDuration.textContent = formatTime(detailsVideo.duration);
});

// KEEPS THE CURRENT TIME AND PROGRESS BAR IN SYNC WHILE PLAYING
detailsVideo.addEventListener("timeupdate", () => {
   videoCurrentTime.textContent = formatTime(detailsVideo.currentTime);
   videoProgress.value = (detailsVideo.currentTime / detailsVideo.duration) * 100 || 0;
});

// DRAGGING THE PROGRESS BAR SEEKS THE VIDEO
videoProgress.addEventListener("input", function(){
   detailsVideo.currentTime = (videoProgress.value / 100) * detailsVideo.duration;
});

// MUTE BUTTON TOGGLES SOUND AND SWAPS THE ICON
videoMuteBtn.addEventListener("click", function(){
   detailsVideo.muted = !detailsVideo.muted;
   videoMuteBtn.innerHTML = detailsVideo.muted
      ? '<i class="fa-solid fa-volume-xmark"></i>'
      : '<i class="fa-solid fa-volume-high"></i>';
});

// FULLSCREEN BUTTON TOGGLES FULLSCREEN ON THE WHOLE VIDEO WRAPPER (INCLUDES CONTROLS)
videoFullscreenBtn.addEventListener("click", function(){
   if (document.fullscreenElement) {
      document.exitFullscreen();
   } else {
      detailsVideoWrap.requestFullscreen();
   }
});

// STOP PLAYBACK WHEN THE MODAL CLOSES
document.getElementById("contentDetailsModal").addEventListener("hidden.bs.modal", function(){
   detailsVideo.pause();
   detailsVideo.currentTime = 0;
});