const profilesDiv = document.querySelector(".profiles");
let editingProfileId = null; //indicator for edit/add profile

function renderProfile(profile) {
    const div = document.createElement("div");
    div.classList.add("profile");
    div.dataset.id = profile.id;
    div.innerHTML = `
        <img src="${profile.image}" alt="${profile.name}" />
        <div class="name-section">
            <span class="name">${profile.name}</span>
            <button class="edit-btn"><i class="fa-regular fa-pen-to-square"></i></button>
        </div>
    `;
    profilesDiv.insertBefore(div, document.querySelector(".add"));

    const editBtn = div.querySelector(".edit-btn");
    /*EDIT PROFILE*/
    editBtn.addEventListener("click", function () {
        editingProfileId = profile.id;
        document.getElementById("newProfileName").value = profile.name;
        document.querySelectorAll(".avatar-option").forEach(img => {
            img.classList.toggle("selected", img.src.includes(profile.image.split("/").pop()));
        });
        document.getElementById("deleteProfile").classList.remove("hidden");
        document.querySelector("#profilePanel h2").textContent = "עריכת פרופיל";
        document.getElementById("profilePanel").classList.remove("hidden");
    });
}

function closePanel() {
    editingProfileId = null;
    document.getElementById("profilePanel").classList.add("hidden");
    document.getElementById("newProfileName").value = "";
    document.getElementById("deleteProfile").classList.remove("confirm-mode");
    document.getElementById("deleteProfile").classList.add("hidden");
    document.getElementById("panelError").classList.add("hidden");
    document.getElementById("newProfileName").classList.remove("input-error");
    document.querySelector("#profilePanel h2").textContent = "פרופיל חדש";
    document.querySelectorAll(".avatar-option").forEach(i => i.classList.remove("selected"));
    document.getElementById("confirmText").classList.remove("visible");
    document.getElementById("confirmText").classList.add("hidden");
}

function showError(msg, highlightInput = false) {
    const err = document.getElementById("panelError");
    err.textContent = msg;
    err.classList.remove("hidden");
    if (highlightInput) {
        document.getElementById("newProfileName").classList.add("input-error");
    }
}

fetch("/profiles/data")
    .then(res => res.json())
    .then(profiles => profiles.forEach(renderProfile));

const addBtn = document.querySelector(".add");

// פתיחת הפאנל
addBtn.addEventListener("click", function () {
    document.getElementById("profilePanel").classList.remove("hidden");
});

// בחירת תמונה
document.querySelectorAll(".avatar-option").forEach(img => {
    img.addEventListener("click", function () {
        document.querySelectorAll(".avatar-option").forEach(i => i.classList.remove("selected"));
        this.classList.add("selected");
    });
});
document.getElementById("newProfileName").addEventListener("input", function () {
    this.classList.remove("input-error");
    document.getElementById("panelError").classList.add("hidden");
});
// ביטול
document.getElementById("cancelAdd").addEventListener("click", closePanel);

// אישור
document.getElementById("confirmAdd").addEventListener("click", function () {
    const name = document.getElementById("newProfileName").value.trim();
    const selected = document.querySelector(".avatar-option.selected");
    if (!name && !selected) return showError("יש למלא שם ולבחור תמונה", true);
    if (!name) return showError("יש למלא שם", true);
    if (!selected) return showError("יש לבחור תמונה");

    const image = selected.src.split("/").slice(-3).join("/");

    if (editingProfileId) {
        // מצב עריכה — PUT
        fetch(`/profiles/${editingProfileId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, image })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const div = document.querySelector(`[data-id="${editingProfileId}"]`);
                div.querySelector(".name").textContent = data.profile.name;
                div.querySelector("img").src = data.profile.image;
                closePanel();
            }
        });
    } else {
        // מצב הוספה — POST
        fetch("/profiles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, image })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderProfile(data.profile);
                closePanel();
            } else {
                showError(data.message, true);
            }
        });
    }
});

// מחיקה
document.getElementById("deleteProfile").addEventListener("click", function () {
    if (!this.classList.contains("confirm-mode")) {
        this.classList.add("confirm-mode");
        document.getElementById("confirmText").classList.remove("hidden");
        setTimeout(() => document.getElementById("confirmText").classList.add("visible"), 10);
        return;
    }
    fetch(`/profiles/${editingProfileId}`, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.querySelector(`[data-id="${editingProfileId}"]`).remove();
            closePanel();
        }
    });
});
