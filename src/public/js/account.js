//_______________________________//
//         ELEMENTS              //
//_______________________________//
const nameDisplay  = document.getElementById("nameDisplay");
const emailDisplay = document.getElementById("emailDisplay");
const nameInput    = document.getElementById("nameInput");
const emailInput   = document.getElementById("emailInput");
const nameEdit     = document.getElementById("nameEdit");
const emailEdit    = document.getElementById("emailEdit");
const message      = document.getElementById("message");

const passwordEdit     = document.getElementById("passwordEdit");
const changePasswordBtn= document.getElementById("changePasswordBtn");
const currentPassword  = document.getElementById("currentPassword");
const newPassword      = document.getElementById("newPassword");
const confirmPassword  = document.getElementById("confirmPassword");

const back        = document.getElementById("back");
const deleteBtn   = document.getElementById("deleteAccount");
const confirmText = document.getElementById("confirmText");

let currentUserId = null;
let currentUserRole = null;


//_______________________________//
//             API               //
//_______________________________//
function loadAccount() {
    fetch("/api/users/me")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                currentUserId = data.user._id;
                currentUserRole = data.user.role;
                nameDisplay.textContent = data.user.name;
                emailDisplay.textContent = data.user.email;

            }
        });
}

function saveField(body, onSuccess) {
    fetch(`/api/users/${currentUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            onSuccess(data.user);
            showMessage("השינויים נשמרו", true);
        } else {
            showError(data.message);
        }
    });
}

function deleteAccount() {
    fetch(`/api/users/${currentUserId}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
            if (data.success) window.location.href = "/";
        });
}


//_______________________________//
//           FUNCTIONS           //
//_______________________________//
function showError(msg, field) {
    message.style.color = "#ff5c5c";
    message.textContent = msg;
    if (field) {
        field.classList.add("input-error");
    }
}

function openEdit(display, editBlock, input) {
    input.value = display.textContent;
    display.classList.add("hidden");
    editBlock.classList.remove("hidden");
}

function closeEdit(display, editBlock) {
    editBlock.classList.add("hidden");
    display.classList.remove("hidden");
    message.textContent = "";
}


//_______________________________//
//         EVENT LISTENERS       //
//_______________________________//
loadAccount();

// open/close edit for name & email
document.querySelectorAll(".edit-btn[data-field]").forEach(btn => {
    btn.addEventListener("click", function () {
        const field = this.dataset.field;
        if (field === "name")  openEdit(nameDisplay, nameEdit, nameInput);
        if (field === "email") openEdit(emailDisplay, emailEdit, emailInput);
    });
});

document.querySelectorAll(".cancel-btn[data-field]").forEach(btn => {
    btn.addEventListener("click", function () {
        const field = this.dataset.field;
        if (field === "name")  closeEdit(nameDisplay, nameEdit);
        if (field === "email") closeEdit(emailDisplay, emailEdit);
    });
});

// save name
nameEdit.querySelector(".save-btn").addEventListener("click", function () {
    const name = nameInput.value.trim();
    if (name.length < 1)  return showError("לא הוקלד שם", nameInput);
    if (name.length > 25) return showError("השם ארוך מדי (עד 25 תווים)", nameInput);
    saveField({ name }, user => {
        nameDisplay.textContent = user.name;
        closeEdit(nameDisplay, nameEdit);
    });
});

// save email
emailEdit.querySelector(".save-btn").addEventListener("click", function () {
    const email = emailInput.value;
    if (!emailInput.validity.valid) return showError("אימייל לא תקין", emailInput);
    saveField({ email }, user => {
        emailDisplay.textContent = user.email;
        closeEdit(emailDisplay, emailEdit);
    });
});

// open/close password edit
changePasswordBtn.addEventListener("click", () => passwordEdit.classList.remove("hidden"));
document.getElementById("cancelPassword").addEventListener("click", function () {
    passwordEdit.classList.add("hidden");
    currentPassword.value = newPassword.value = confirmPassword.value = "";
    message.textContent = "";
});

// save password
document.getElementById("savePassword").addEventListener("click", function () {
    if (newPassword.value.length < 6)             return showError("הסיסמה חייבת להכיל לפחות 6 תווים", newPassword);
    if (newPassword.value !== confirmPassword.value) return showError("הסיסמאות אינן תואמות", confirmPassword);

    saveField(
        { password: newPassword.value, currentPassword: currentPassword.value },
        () => {
            passwordEdit.classList.add("hidden");
            currentPassword.value = newPassword.value = confirmPassword.value = "";
        }
    );
});

// clear message while typing in any field
document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", function () {
        message.textContent = "";
        this.classList.remove("input-error");
    });
});
back.addEventListener("click", function(){
    if (currentUserRole === "admin") {
        back.href="/admin";
        return;
    }
    back.href="/main";
});
// delete account
deleteBtn.addEventListener("click", function () {
    if (confirm("האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו בלתי הפיכה.")) {
        deleteAccount();
    }
});