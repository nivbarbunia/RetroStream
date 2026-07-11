//_______________________________//
//         DOM ELEMENTS          //
//_______________________________//
const logoutBtn = document.getElementById("logoutBtn");
const originChart = document.getElementById("originChart");
const genreChart = document.getElementById("genreChart");
const leaderboardChart = document.getElementById("leaderboardChart");
const likedChart = document.getElementById("likedChart");

//_______________________________//
//             API               //
//_______________________________//

//FETCHES ALL STATS ENDPOINTS TOGETHER
function loadStats(){
   return Promise.all([
      fetch("/api/stats/by-origin").then(res => res.json()),
      fetch("/api/stats/by-genre").then(res => res.json()),
      fetch("/api/stats/top-watched").then(res => res.json()),
      fetch("/api/stats/top-liked").then(res => res.json()),
      fetch("/api/stats/totals").then(res => res.json())
   ]);
}

//ENDS THE SESSION AND RETURNS TO LOGIN
function logout() {
    fetch("/api/auth/logout", { method: "POST" })
        .then(res => res.json())
        .then(() => { window.location.href = "/"; });
}

//_______________________________//
//        DATA SHAPING           //
//_______________________________//

//MERGES CATALOG + WATCH COUNTS INTO ONE ROW PER CATEGORY, FOR THE GROUPED BAR CHART
function mergeStats(catalog, watches){
   const map = {};
   catalog.forEach(d => {
      map[d._id] = map[d._id] || { category: d._id, catalogCount: 0, watchCount: 0 };
      map[d._id].catalogCount = d.count;
   });
   watches.forEach(d => {
      map[d._id] = map[d._id] || { category: d._id, catalogCount: 0, watchCount: 0 };
      map[d._id].watchCount = d.count;
   });
   return Object.values(map).sort((a, b) => b.catalogCount - a.catalogCount);
}

//ROUNDS TOTAL SECONDS WATCHED INTO WHOLE HOURS FOR THE KPI STRIP
function formatHours(seconds){
   return Math.round(seconds / 3600);
}

//_______________________________//
//        D3 CHARTS              //
//_______________________________//

//DRAWS A GROUPED BAR CHART: ONE PAIR OF BARS (CATALOG / WATCHES) PER CATEGORY
function drawGroupedBar(container, data){
   container.innerHTML = "";   // clear previous chart before redrawing

   const width = container.clientWidth;
   const height = 400;
   const margin = { top: 20, right: 30, bottom: 60, left: 50 };

   const svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height);

   //OUTER SCALE: ONE BAND PER CATEGORY
   const x0 = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([margin.left, width - margin.right])
      .paddingInner(0.3)
      .paddingOuter(0.15);

   //INNER SCALE: WITHIN EACH CATEGORY'S BAND, TWO SUB-BARS (CATALOG / WATCHES)
   const x1 = d3.scaleBand()
      .domain(["catalogCount", "watchCount"])
      .range([0, x0.bandwidth()])
      .padding(0.1);

   const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.catalogCount, d.watchCount))]).nice()
      .range([height - margin.bottom, margin.top]);

   const color = d3.scaleOrdinal()
      .domain(["catalogCount", "watchCount"])
      .range(["#25ff42", "rgba(255,255,255,0.5)"]);

   //ONE GROUP <g> PER CATEGORY, POSITIONED ALONG x0
   const groups = svg.selectAll("g.category")
      .data(data)
      .join("g")
      .attr("class", "category")
      .attr("transform", d => `translate(${x0(d.category)},0)`);

   //INSIDE EACH GROUP, ONE BAR PER KEY (catalogCount / watchCount), POSITIONED ALONG x1
   groups.selectAll("rect")
      .data(d => ["catalogCount", "watchCount"].map(key => ({ key, value: d[key] })))
      .join("rect")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", d => color(d.key));

   svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0).tickPadding(10))
      .selectAll("text").attr("fill", "white");

   svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickPadding(10))
      .selectAll("text")
      .attr("fill", "white")
      .style("direction", "ltr");   // numbers are LTR; without this the page's rtl flips them onto the axis

   svg.selectAll(".domain, .tick line").attr("stroke", "rgba(255,255,255,0.3)");
}

//DRAWS A RANKED LIST: LABEL ABOVE EACH BAR, BAR ON A FAINT FULL-WIDTH TRACK, GROWING FROM THE RIGHT (RTL)
//GENERIC: data items are { title, value }; `unit` is the word after the number (e.g. "צפיות" / "לייקים")
function drawLeaderboard(container, data, unit){
   container.innerHTML = "";

   const width = container.clientWidth;
   const rowHeight = 48;
   const barHeight = 12;
   const labelGap = 28;   // vertical space reserved above each bar for its label
   const margin = { top: 8, right: 4, bottom: 8, left: 4 };
   const trackWidth = width - margin.left - margin.right;
   const height = data.length * rowHeight + margin.top + margin.bottom;

   const svg = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height);

   const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([0, trackWidth]);

   //NOTE: class must NOT be "row" - that collides with Bootstrap's .row > * { width:100% },
   //which would override each rect's SVG width and stretch every bar to full width.
   const rows = svg.selectAll("g.lb-row")
      .data(data)
      .join("g")
      .attr("class", "lb-row")
      .attr("transform", (d, i) => `translate(${margin.left}, ${margin.top + i * rowHeight})`);

   //LABEL ABOVE THE BAR - RIGHT-ALIGNED. text-anchor "start" (NOT "end") because the
   //page is dir="rtl": the SVG text inherits RTL, so "start" is the visual RIGHT edge.
   rows.append("text")
      .attr("x", trackWidth)
      .attr("y", 0)
      .attr("dy", "0.85em")
      .attr("text-anchor", "start")
      .attr("fill", "white")
      .text((d, i) => `${i + 1}. ${d.title} — ${d.value} ${unit}`);

   //FAINT FULL-WIDTH TRACK BEHIND EACH BAR, SO EVEN SHORT BARS READ AS PART OF A CHART
   rows.append("rect")
      .attr("x", 0)
      .attr("y", labelGap)
      .attr("width", trackWidth)
      .attr("height", barHeight)
      .attr("rx", barHeight / 2)
      .attr("fill", "rgba(255,255,255,0.08)");

   //THE VALUE BAR - GROWS FROM THE RIGHT EDGE LEFTWARD (NATURAL FOR RTL)
   rows.append("rect")
      .attr("x", d => trackWidth - x(d.value))
      .attr("y", labelGap)
      .attr("width", d => x(d.value))
      .attr("height", barHeight)
      .attr("rx", barHeight / 2)
      .attr("fill", "#25ff42");
}

//_______________________________//
//        INIT + RENDER          //
//_______________________________//

// KEPT IN MODULE SCOPE SO THE RESIZE HANDLER CAN REDRAW WITHOUT RE-FETCHING
let originData = [];
let genreData = [];
let watchedData = [];
let likedData = [];

// EACH draw* READS ITS CONTAINER'S CURRENT WIDTH, SO RE-CALLING THEM = RESPONSIVE REDRAW
function renderCharts(){
   drawGroupedBar(originChart, originData);
   drawGroupedBar(genreChart, genreData);
   drawLeaderboard(leaderboardChart, watchedData, "צפיות");
   drawLeaderboard(likedChart, likedData, "לייקים");
}

loadStats().then(([origin, genre, watched, liked, totals]) => {
   document.getElementById("kpiContentCount").textContent = totals.contentCount;
   document.getElementById("kpiWatchHours").textContent = formatHours(totals.totalSeconds);
   document.getElementById("kpiTopOrigin").textContent = origin.catalog[0]?._id || "-";
   document.getElementById("kpiTopGenre").textContent = genre.catalog[0]?._id || "-";

   originData = mergeStats(origin.catalog, origin.watches);
   genreData = mergeStats(genre.catalog, genre.watches);
   // reshape both leaderboards into the generic { title, value } form
   watchedData = watched.top.map(d => ({ title: d.content.title, value: d.views }));
   likedData = liked.top.map(d => ({ title: d.title, value: d.likes }));
   renderCharts();
});

//_______________________________//
//        EVENT LISTENERS        //
//_______________________________//
logoutBtn.addEventListener("click", logout);

// REDRAW ON RESIZE (DEBOUNCED) SO CHARTS ALWAYS FIT THE CURRENT WINDOW WIDTH
let resizeTimer;
window.addEventListener("resize", function(){
   clearTimeout(resizeTimer);
   resizeTimer = setTimeout(renderCharts, 150);
});
