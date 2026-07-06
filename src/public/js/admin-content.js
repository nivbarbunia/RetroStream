//_______________________________//
//         ELEMENTS              //
//_______________________________//
const contentBody      = document.getElementById("contentBody");
const searchMode       = document.getElementById("searchMode");
const searchInput      = document.getElementById("searchInput");
const typeRadios       = document.querySelectorAll('input[name="typeFilter"]');
const message          = document.getElementById("message");
const logoutBtn        = document.getElementById("logoutBtn");
const submitBtn        = document.getElementById("submitBtn");
const resetBtn         = document.getElementById("resetBtn");
const addBtn           = document.getElementById("addBtn");

const fTitle          = document.getElementById("fTitle");
const fYear           = document.getElementById("fYear");
const fType           = document.getElementById("fType");
const fEpisodeLength  = document.getElementById("fEpisodeLength");
const fDuration       = document.getElementById("fDuration");
const fRating         = document.getElementById("fRating");
const fGenre          = document.getElementById("fGenre");
const fOrigin         = document.getElementById("fOrigin");
const fImage          = document.getElementById("fImage");
const fVideoUrl       = document.getElementById("fVideoUrl");
const fFranchise      = document.getElementById("fFranchise");
const fDescription    = document.getElementById("fDescription");
const episodeLengthWrap = document.getElementById("episodeLengthWrap");
const durationWrap      = document.getElementById("durationWrap");
const modalTitle      = document.getElementById("modalTitle");
const modalMessage    = document.getElementById("modalMessage");
const contentModal    = new bootstrap.Modal(document.getElementById("contentModal"));

let baseContent = []; // הרשימה הנוכחית מהשרת (כל התוכן או תוצאות חיפוש)
let editingId = null;

const placeholders = {
    title: "חפש לפי כותרת...",
    genre: "חפש לפי ז'אנר...",
    origin: "חפש לפי מדינת מקור...",
    franchise: "חפש לפי פרנצ'ייז...",
    description: "חפש לפי תיאור...",
    q: "חיפוש חופשי..."
};


//_______________________________//
//             API               //
//_______________________________//
function loadContent() {
    fetch("/api/content")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                resetBtn.classList.add("hidden");
                message.textContent = "";
                searchInput.value = "";
                baseContent = data.content;
                renderFiltered();
            }
        });
}

function searchContent() {
    const params = new URLSearchParams();
    params.set(searchMode.value, searchInput.value.trim());

    fetch(`/api/content/search?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
            resetBtn.classList.remove("hidden");
            if (data.success) {
                baseContent = data.content;
                message.textContent = `נמצאו ${data.content.length} תוצאות`;
            } else {
                baseContent = [];
                message.textContent = data.message;
            }
            renderFiltered();
        });
}

function saveContent() {
    const type = fType.value;
    const body = {
        title: fTitle.value.trim(),
        year: Number(fYear.value),
        type,
        genre: fGenre.value.split(",").map(g => g.trim()).filter(Boolean),
        origin: fOrigin.value.split(",").map(o => o.trim()).filter(Boolean),
        image: fImage.value.trim(),
        videoUrl: fVideoUrl.value.trim(),
        franchise: fFranchise.value.trim(),
        description: fDescription.value.trim(),
        rating: fRating.value ? Number(fRating.value) : undefined
    };
    if (type === "סדרה") body.episodeLength = fEpisodeLength.value ? Number(fEpisodeLength.value) : undefined;
    if (type === "סרט")  body.duration      = fDuration.value ? Number(fDuration.value) : undefined;

    const isEdit = Boolean(editingId);
    const url = isEdit ? `/api/content/${editingId}` : "/api/content";
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            contentModal.hide();
            loadContent();
        } else {
            modalMessage.textContent = data.message;
        }
    });
}

function deleteContent(id) {
    fetch(`/api/content/${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
            if (data.success) loadContent();
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
function renderFiltered() {
    const checked = document.querySelector('input[name="typeFilter"]:checked');
    const typeValue = checked ? checked.value : "";
    const filtered = typeValue
        ? baseContent.filter(c => c.type === typeValue)
        : baseContent;
    renderContent(filtered);
}

function renderContent(items) {
    contentBody.innerHTML = items.map(rowHtml).join("");
}

function rowHtml(c) {
    return `
        <tr data-id="${c._id}">
            <td><img class="thumb" src="/${c.image}" alt="${c.title}" /></td>
            <td>${c.title}</td>
            <td>${c.year}</td>
            <td>${c.type}</td>
            <td>${(c.genre || []).join(", ")}</td>
            <td>${c.rating ?? "-"}</td>
            <td class="row-actions">
                <button class="edit-content" title="ערוך"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="delete-content" title="מחק"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
}

function toggleTypeFields() {
    if (fType.value === "סדרה") {
        episodeLengthWrap.classList.remove("hidden");
        durationWrap.classList.add("hidden");
    } else {
        durationWrap.classList.remove("hidden");
        episodeLengthWrap.classList.add("hidden");
    }
}

function openCreateModal() {
    editingId = null;
    modalTitle.textContent = "הוספת תוכן";
    modalMessage.textContent = "";
    fTitle.value = "";
    fYear.value = "";
    fType.value = "סדרה";
    fEpisodeLength.value = "";
    fDuration.value = "";
    fRating.value = "";
    fGenre.value = "";
    fOrigin.value = "";
    fImage.value = "";
    fVideoUrl.value = "";
    fFranchise.value = "";
    fDescription.value = "";
    toggleTypeFields();
    contentModal.show();
}

function openEditModal(id) {
    const c = baseContent.find(x => x._id === id);
    editingId = id;
    modalTitle.textContent = "עריכת תוכן";
    modalMessage.textContent = "";
    fTitle.value = c.title;
    fYear.value = c.year;
    fType.value = c.type;
    fEpisodeLength.value = c.episodeLength ?? "";
    fDuration.value = c.duration ?? "";
    fRating.value = c.rating ?? "";
    fGenre.value = (c.genre || []).join(", ");
    fOrigin.value = (c.origin || []).join(", ");
    fImage.value = c.image ?? "";
    fVideoUrl.value = c.videoUrl ?? "";
    fFranchise.value = c.franchise ?? "";
    fDescription.value = c.description ?? "";
    toggleTypeFields();
    contentModal.show();
}


//_______________________________//
//         EVENT LISTENERS       //
//_______________________________//
loadContent();

searchMode.addEventListener("change", function () {
    searchInput.placeholder = placeholders[searchMode.value];
});

submitBtn.addEventListener("click", function () {
    if (!searchInput.value.trim()) {
        message.classList.add("error");
        message.textContent = "לא הוזן קלט לחיפוש";
        return;
    }
    message.classList.remove("error");
    searchContent();
});

resetBtn.addEventListener("click", function () {
    loadContent();
});

typeRadios.forEach(radio => {
    radio.addEventListener("change", function () {
        typeRadios.forEach(r => r.closest(".type-radio").classList.remove("active"));
        radio.closest(".type-radio").classList.add("active");
        renderFiltered();
    });
});

// ברירת מחדל: "הכל" מסומן כ-active עם טעינת הדף
document.querySelector('input[name="typeFilter"]:checked').closest(".type-radio").classList.add("active");

addBtn.addEventListener("click", openCreateModal);

fType.addEventListener("change", toggleTypeFields);

contentBody.addEventListener("click", function (e) {
    const editBtn = e.target.closest(".edit-content");
    const deleteBtn = e.target.closest(".delete-content");
    if (editBtn) {
        openEditModal(editBtn.closest("tr").dataset.id);
    } else if (deleteBtn) {
        if (confirm("למחוק את התוכן?")) {
            deleteContent(deleteBtn.closest("tr").dataset.id);
        }
    }
});

document.getElementById("saveContent").addEventListener("click", saveContent);

logoutBtn.addEventListener("click", logout);