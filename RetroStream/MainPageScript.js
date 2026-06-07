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