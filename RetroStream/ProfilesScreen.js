const profilesDiv = document.querySelector(".profiles");
let editingProfileId = null; //indicator for edit/add profile
const addBtn = document.querySelector(".add"); //ADD BUTTON


function renderProfile(profile) {
    const div = document.createElement("div");
    div.classList.add("profile");
    div.dataset.id = profile.id; /*CREATE HTML PROFILE*/
    div.innerHTML = ` 
        <img src="${profile.image}" alt="${profile.name}" />
        <div class="name-section">
            <span class="name">${profile.name}</span>
            <button class="edit-btn"><i class="fa-regular fa-pen-to-square"></i></button>
        </div>
    `;

    profilesDiv.insertBefore(div, document.querySelector(".add")); //INSERT NEW PROFILE TO HTML CODE
    const editBtn = div.querySelector(".edit-btn");
    //EDIT PROFILE CLIENT
    editBtn.addEventListener("click", function () {
        openPanel(profile);
    });

    //REDIRECT TO MAIN FROM A PROFILE CLICK
    div.querySelector("img").addEventListener("click", function () {
        window.location.href = "/main";
    });
}
//OPEN-PANEL - EDIT || ADD
function openPanel(profile = null) {
    if (profile) { //EDIT STATE
        editingProfileId = profile.id;
        document.getElementById("deleteProfile").classList.remove("hidden");
        document.getElementById("panelTitle").textContent = "עריכת פרופיל";
        document.getElementById("newProfileName").value = profile.name;
        document.querySelectorAll(".avatar-option").forEach(img => {
            img.classList.toggle("selected", img.src.includes(profile.image.split("/").pop()));
        });
        document.getElementById("deleteProfile").classList.remove("hidden");
    } else { //ADD STATE
        document.getElementById("panelTitle").textContent = "פרופיל חדש";
    }
    document.getElementById("profilePanel").classList.remove("hidden"); //OPEN PANEL
}

//CLOSE-PANEL - RESETS PANEL
function closePanel() {
    // state
    editingProfileId = null;

    // input 
    document.getElementById("newProfileName").value = "";

    //input error state
    document.getElementById("newProfileName").classList.remove("input-error");
    document.getElementById("panelError").classList.add("hidden");

    // avatars
    document.querySelectorAll(".avatar-option").forEach(i => i.classList.remove("selected"));

    // delete button
    document.getElementById("deleteProfile").classList.remove("confirm-mode");
    document.getElementById("deleteProfile").classList.add("hidden");

    //confirm deletion animation
    document.getElementById("confirmText").classList.remove("visible");
    document.getElementById("confirmText").classList.add("hidden");

    // Close panel
    document.getElementById("profilePanel").classList.add("hidden");

}

//Error message
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

// ADD PROFILE CLIENT
addBtn.addEventListener("click", function () {
    openPanel();
});

// CHOOSE AVATAR
document.querySelectorAll(".avatar-option").forEach(img => {
    img.addEventListener("click", function () {
        document.querySelectorAll(".avatar-option").forEach(i => i.classList.remove("selected"));
        this.classList.add("selected");
    });
});
//SET PROFILE NAME
document.getElementById("newProfileName").addEventListener("input", function () {
    this.classList.remove("input-error");
    document.getElementById("panelError").classList.add("hidden");
});
// Cancel ADD || EDIT
document.getElementById("cancelProfile").addEventListener("click", closePanel);

// Confirm ADD || EDIT
document.getElementById("confirmProfile").addEventListener("click", function () {
    const name = document.getElementById("newProfileName").value.trim();
    const selected = document.querySelector(".avatar-option.selected");
    if (!name && !selected) return showError("יש למלא שם ולבחור תמונה", true);
    if (!name) return showError("יש למלא שם", true);
    if (!selected) return showError("יש לבחור תמונה");

    const image = selected.src.split("/").slice(-3).join("/");

    if (editingProfileId) {
        //PUT - EDIT PROFILE : SERVER
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
        //POST - ADD PROFILE : SERVER
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

// DELETE PROFILE
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
