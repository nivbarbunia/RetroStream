//_______________________________//
//         ELEMENTS              //
//_______________________________//
const usersBody   = document.getElementById("usersBody");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const logoutBtn   = document.getElementById("logoutBtn");
const submitBtn   = document.getElementById("submitBtn");
const resetBtn    = document.getElementById("resetBtn");

const editName     = document.getElementById("editName");
const editEmail    = document.getElementById("editEmail");
const editRole     = document.getElementById("editRole");
const modalMessage = document.getElementById("modalMessage");
const editModal    = new bootstrap.Modal(document.getElementById("editModal"));

let allUsers = [];
let editingUserId = null;


//_______________________________//
//             API               //
//_______________________________//
function loadUsers() {
    fetch("/api/users")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                resetBtn.classList.add("hidden");
                message.textContent="";
                searchInput.value="";
                allUsers = data.users;
                renderUsers(allUsers);
            }
        });
}

function searchUsers(q) {
    fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                allUsers = data.users;
                resetBtn.classList.remove("hidden");
                message.textContent="תוצאות חיפוש עבור: " + q;
                renderUsers(allUsers);
            }else {
                allUsers = [];
                resetBtn.classList.remove("hidden");
                message.textContent = data.message;
                renderUsers(allUsers);
            }
        });
}

function updateUser(id, body) {
    fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            editModal.hide();
            loadUsers();
        } else {
            modalMessage.textContent = data.message;
        }
    });
}

function deleteUser(id) {
    fetch(`/api/users/${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
            if (data.success) loadUsers();
        });
}

function logout() {
    fetch("/api/auth/logout", { method: "POST" })
        .then(res => res.json())
        .then(() => { window.location.href = "/"; });
}


//_______________________________//
//         DOM / RENDER          //
//_______________________________//
function renderUsers(users) {
    usersBody.innerHTML = users.map(rowHtml).join("");
}

function rowHtml(u) {
    return `
        <tr data-id="${u._id}">
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td class="row-actions">
                <button class="edit-user" title="ערוך"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="delete-user" title="מחק"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
}

function openEditModal(id) {
    const u = allUsers.find(x => x._id === id);
    editingUserId = id;
    editName.value = u.name;
    editEmail.value = u.email;
    editRole.value = u.role;
    modalMessage.textContent = "";
    editModal.show();
}


//_______________________________//
//         EVENT LISTENERS       //
//_______________________________//
loadUsers();

// search
submitBtn.addEventListener("click", function () {
    const q = searchInput.value.trim();
    if (q === "") {
        searchInput.classList.add("error");
        message.classList.add("error");
        message.textContent="לא הוזנו נתוני חיפוש";
        return;
    }
    else {
        searchUsers(q);
    }
});

resetBtn.addEventListener("click",function(){
    loadUsers();
});

searchInput.addEventListener("input", function(e){
    searchInput.classList.remove("error");
    message.classList.remove("error");
    message.textContent="";
});

// edit / delete buttons in rows
usersBody.addEventListener("click", function (e) {
    const editBtn = e.target.closest(".edit-user");
    const deleteBtn = e.target.closest(".delete-user");
    if (editBtn) {
        openEditModal(editBtn.closest("tr").dataset.id);
    } else if (deleteBtn) {
        if (confirm("למחוק את המשתמש?")) {
            deleteUser(deleteBtn.closest("tr").dataset.id);
        }
    }
});

// save from modal
document.getElementById("saveEdit").addEventListener("click", function () {
    const body = {
        name: editName.value.trim(),
        email: editEmail.value,
        role: editRole.value
    };
    updateUser(editingUserId, body);
});

// logout
logoutBtn.addEventListener("click", logout);