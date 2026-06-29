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

let contentItems = [];
let sorted= [];
const heroSection = document.getElementById("heroSection");

//GET content array, Sorted array and Hero section from server, then renders feed.
fetch("/api/content")
    .then(res => res.json())
    .then(data => {
        contentItems = data.content;
        sorted=[...contentItems].sort((a,b)=>a.title.localeCompare(b.title, 'he'));
        const featuredItem =  contentItems[Math.floor(Math.random() * contentItems.length)]; 
        // HERO SECTION
         heroSection.innerHTML= `
            <div class="hero-content">
               <div class="hero-text">
                  <p class="hero-label">במיוחד בשבילך</p>
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
        renderFeed(data.content);
    });




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
//LOGOUT
document.getElementById("logoutBtn").addEventListener("click", function () {
    fetch("/logout", { method: "POST" })
        .then(res => res.json())
        .then(() => {
            window.location.href = "/";
        });
});




