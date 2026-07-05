//ELEMENTS
const logoutBtn = document.getElementById("logoutBtn");

//API   
function logout() {
    fetch("/api/auth/logout", { method: "POST" })
        .then(res => res.json())
        .then(() => { window.location.href = "/"; });
}
//EVENT LISTENERS
logoutBtn.addEventListener("click", logout);