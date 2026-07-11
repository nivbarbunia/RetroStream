//_______________________________//
//         ELEMENTS              //
//_______________________________//
const logoutBtn = document.getElementById("logoutBtn");


//_______________________________//
//             API               //
//_______________________________//
function logout() {
    fetch("/api/auth/logout", { method: "POST" })
        .then(res => res.json())
        .then(() => { window.location.href = "/"; });
}


//_______________________________//
//         EVENT LISTENERS       //
//_______________________________//
logoutBtn.addEventListener("click", logout);
