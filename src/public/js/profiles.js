//
//ELEMENTS
//
const profilesDiv = document.querySelector(".profiles");
const addBtn      = document.querySelector(".add");
const panel       = document.getElementById("profilePanel");
const panelTitle  = document.getElementById("panelTitle");
const nameInput   = document.getElementById("newProfileName");
const panelError  = document.getElementById("panelError");
const deleteBtn   = document.getElementById("deleteProfile");
const confirmText = document.getElementById("confirmText");
const cancelBtn   = document.getElementById("cancelProfile");
const confirmBtn  = document.getElementById("confirmProfile");
const avatars     = document.querySelectorAll(".avatar-option");
const birthDateInput = document.getElementById("newProfileBirthDate");

let editingProfileId = null; // null = add mode, id = edit mode


//
//API - SERVER SIDE
//
function loadProfiles() {
    fetch("/api/profiles")
        .then(res => res.json())
        .then(data => data.profile.forEach(renderProfile));
}

function createProfile(body) {
    fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            renderProfile(data.profile);
            closePanel();
        } else {
            showError(data.message, [nameInput]);
        }
    });
}

function updateProfile(id, body) {
    fetch(`/api/profiles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const edited = renderProfile(data.profile);
            document.querySelector(`[data-id="${id}"]`).replaceWith(edited);    
            closePanel();
        } else {
            showError(data.message, [nameInput]);
        }
    });
}

function deleteProfile(id) {
    fetch(`/api/profiles/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.querySelector(`[data-id="${id}"]`).remove();
            closePanel();
        } 
    });
}

//
//DOM
//

function renderProfile(profile) {
    const div = document.createElement("div");
    div.classList.add("profile");
    div.dataset.id = profile._id;
    div.innerHTML = `
        <img src="${profile.image}" alt="${profile.name}" />
        <div class="name-section">
            <span class="name">${profile.name}</span>
            <button class="edit-btn"><i class="fa-regular fa-pen-to-square"></i></button>
        </div>
    `;
    profilesDiv.insertBefore(div, addBtn);

    // edit profile + dynamic listener
    div.querySelector(".edit-btn").addEventListener("click", () => openPanel(profile));
    // click profile image -> main page dynamic listener
    div.querySelector("img").addEventListener("click", () => {
        window.location.href = "/main";
    });
    return div;
}

//OPEN PANEL - EDIT || ADD
function openPanel(profile = null) {
    if (profile) { // EDIT state
        editingProfileId = profile._id;
        panelTitle.textContent = "עריכת פרופיל";
        deleteBtn.classList.remove("hidden");
        nameInput.value = profile.name;
        avatars.forEach(img => {
            img.classList.toggle("selected", img.src.includes(profile.image.split("/").pop()));
        });
        birthDateInput.value = profile.birthDate ? profile.birthDate.split("T")[0] : "";
    } else { // ADD state
        panelTitle.textContent = "פרופיל חדש";
        avatars[0].classList.add("selected");
    }
    panel.classList.remove("hidden");
}
//ERROR MESSAGE
function showError(msg, fields=[]) {
    panelError.textContent = msg;
    panelError.classList.remove("hidden");
    fields.forEach(f => f.classList.add("input-error"));
}

//CLOSE PANEL - resets panel
function closePanel() {
    editingProfileId = null;
    nameInput.value = "";
    nameInput.classList.remove("input-error");
    avatars.forEach(i => i.classList.remove("selected"));
    birthDateInput.value="";
    birthDateInput.classList.remove("input-error");
    panelError.classList.add("hidden");
    deleteBtn.classList.remove("confirm-mode");
    deleteBtn.classList.add("hidden");
    confirmText.classList.remove("visible");
    confirmText.classList.add("hidden");
    panel.classList.add("hidden");
}




//
//STATIC EVENT LISTENERS
//


// initial load
loadProfiles();

// open add panel
addBtn.addEventListener("click", () => openPanel());

// choose avatar
avatars.forEach(img => {
    img.addEventListener("click", function () {
        avatars.forEach(i => i.classList.remove("selected"));
        this.classList.add("selected");
    });
});

// clear error while typing
nameInput.addEventListener("input", function () {
    this.classList.remove("input-error");
    panelError.classList.add("hidden");
});
birthDateInput.addEventListener("input", function () {
    this.classList.remove("input-error");
    panelError.classList.add("hidden");
});

// cancel
cancelBtn.addEventListener("click", closePanel);

// confirm (add || edit)
confirmBtn.addEventListener("click", function () {
    const name = nameInput.value.trim();
    const selected = document.querySelector(".avatar-option.selected");
    const birthDate = birthDateInput.value;
    const today = new Date().toISOString().split("T")[0]; //max date
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120); 
    const min = minDate.toISOString().split("T")[0]; //min date
    if (!name && !birthDate) return showError("יש למלא שם ולמלא תאריך לידה", [nameInput, birthDateInput]);
    if (!name) return showError("יש למלא שם", [nameInput]);
    if (!birthDate) return showError("יש למלא תאריך לידה", [birthDateInput]);
    if (birthDate > today) return showError("תאריך לידה לא יכול להיות עתידי", [birthDateInput]);
    if (birthDate < min) return showError("תאריך לידה ישן מדי", [birthDateInput]);

    const image = selected.src.split("/").slice(-3).join("/");
    

    if (editingProfileId) {
        updateProfile(editingProfileId, { name, image, birthDate });
    } else {
        createProfile({ name, image, birthDate });
    }
});

// delete (two-step confirm)
deleteBtn.addEventListener("click", function () {
    if (!this.classList.contains("confirm-mode")) {
        this.classList.add("confirm-mode");
        confirmText.classList.remove("hidden");
        setTimeout(() => confirmText.classList.add("visible"), 10);
        return;
    }
    deleteProfile(editingProfileId);
});