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
const filterChips      = document.getElementById("activeFilters");

const formTitle          = document.getElementById("formTitle");
const formYear           = document.getElementById("formYear");
const formType           = document.getElementById("formType");
const formEpisodeLength  = document.getElementById("formEpisodeLength");
const formDuration       = document.getElementById("formDuration");
const formRating         = document.getElementById("formRating");
const formGenre          = document.getElementById("formGenre");
const formOrigin         = document.getElementById("formOrigin");
const formImage          = document.getElementById("formImage");
const formVideoUrl       = document.getElementById("formVideoUrl");
const formFranchise      = document.getElementById("formFranchise");
const formFilmingLocation = document.getElementById("formFilmingLocation");
const formDescription    = document.getElementById("formDescription");
const episodeLengthWrap = document.getElementById("episodeLengthWrap");
const durationWrap      = document.getElementById("durationWrap");
const modalTitle      = document.getElementById("modalTitle");
const modalMessage    = document.getElementById("modalMessage");
const contentModal    = new bootstrap.Modal(document.getElementById("contentModal"));

let baseContent = []; // הרשימה הנוכחית מהשרת (כל התוכן או תוצאות חיפוש)
let editingId = null;
let activeFilters = []; // { field, value } - צ'יפי חיפוש פעילים, כולם AND ביניהם

const placeholders = {
    title: "חפש לפי כותרת...",
    genre: "חפש לפי ז'אנר...",
    origin: "חפש לפי ערוץ/מקור...",
    franchise: "חפש לפי פרנצ'ייז...",
    description: "חפש לפי תיאור...",
    year: "חפש לפי שנה...",
    ratingMin: "דירוג מינימלי (0-10)...",
    ratingMax: "דירוג מקסימלי (0-10)...",
    maxLength: "אורך מקסימלי (דק')...",
    q: "חיפוש חופשי..."
};

const fieldLabels = {
    title: "כותרת",
    genre: "ז'אנר",
    origin: "מקור",
    franchise: "פרנצ'ייז",
    description: "תיאור",
    year: "שנה",
    ratingMin: "דירוג מינימלי",
    ratingMax: "דירוג מקסימלי",
    maxLength: "אורך מקסימלי",
    q: "חיפוש חופשי"
};

const stackableFields = ["genre", "origin", "franchise"];


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
                activeFilters = [];
                renderChips();
                baseContent = data.content;
                renderFiltered();
            }
        });
}

function runSearch() {
    if (!activeFilters.length) {
        loadContent();
        return;
    }
    const params = new URLSearchParams();
    activeFilters.forEach(chip => params.append(chip.field, chip.value));

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

function refresh() {
    if (activeFilters.length) runSearch();
    else loadContent();
}

function saveContent() {
    const type = formType.value;
    const body = {
        title: formTitle.value.trim(),
        year: Number(formYear.value),
        type,
        genre: formGenre.value.split(",").map(genre => genre.trim()).filter(Boolean),
        origin: formOrigin.value.split(",").map(origin => origin.trim()).filter(Boolean),
        image: formImage.value.trim(),
        videoUrl: formVideoUrl.value.trim(),
        franchise: formFranchise.value.split(",").map(franchise => franchise.trim()).filter(Boolean),
        filmingLocation: formFilmingLocation.value.trim(),
        description: formDescription.value.trim(),
        rating: formRating.value ? Number(formRating.value) : undefined
    };
    if (type === "סדרה") body.episodeLength = formEpisodeLength.value ? Number(formEpisodeLength.value) : undefined;
    if (type === "סרט")  body.duration      = formDuration.value ? Number(formDuration.value) : undefined;

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
            refresh();
        } else {
            modalMessage.textContent = data.message;
        }
    });
}

function deleteContent(id) {
    fetch(`/api/content/${id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
            if (data.success) refresh();
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
function renderChips() {
    filterChips.innerHTML = activeFilters.map((chip, index) => `
        <span class="filter-chip">
            ${fieldLabels[chip.field] || chip.field}: ${chip.value}
            <button type="button" class="chip-remove" data-index="${index}">✕</button>
        </span>`).join("");
}

function renderFiltered() { //LIVE TYPE RENDER
    const checked = document.querySelector('input[name="typeFilter"]:checked');
    const typeValue = checked ? checked.value : "";
    const filtered = typeValue
        ? baseContent.filter(item => item.type === typeValue)
        : baseContent;
    renderContent(filtered);
}

function renderContent(items) {
    contentBody.innerHTML = items.map(rowHtml).join("");
}

function rowHtml(item) {
    return `
        <tr data-id="${item._id}">
            <td><img class="thumb" src="/${item.image}" alt="${item.title}" /></td>
            <td>${item.title}</td>
            <td>${item.year}</td>
            <td>${item.type}</td>
            <td>${(item.genre || []).join(", ")}</td>
            <td>${item.rating ?? "-"}</td>
            <td class="row-actions">
                <button class="edit-content" title="ערוך"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="delete-content" title="מחק"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
}

function toggleTypeFields() {
    if (formType.value === "סדרה") {
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
    formTitle.value = "";
    formYear.value = "";
    formType.value = "סדרה";
    formEpisodeLength.value = "";
    formDuration.value = "";
    formRating.value = "";
    formGenre.value = "";
    formOrigin.value = "";
    formImage.value = "";
    formVideoUrl.value = "";
    formFranchise.value = "";
    formFilmingLocation.value = "";
    formDescription.value = "";
    toggleTypeFields();
    contentModal.show();
}

function openEditModal(id) {
    const content = baseContent.find(item => item._id === id);
    editingId = id;
    modalTitle.textContent = "עריכת תוכן";
    modalMessage.textContent = "";
    formTitle.value = content.title;
    formYear.value = content.year;
    formType.value = content.type;
    formEpisodeLength.value = content.episodeLength ?? "";
    formDuration.value = content.duration ?? "";
    formRating.value = content.rating ?? "";
    formGenre.value = (content.genre || []).join(", ");
    formOrigin.value = (content.origin || []).join(", ");
    formImage.value = content.image ?? "";
    formVideoUrl.value = content.videoUrl ?? "";
    formFranchise.value = (content.franchise || []).join(", ");
    formFilmingLocation.value = content.filmingLocation ?? "";
    formDescription.value = content.description ?? "";
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
    const field = searchMode.value;
    if (!stackableFields.includes(field)) {
        activeFilters = activeFilters.filter(chip => chip.field !== field);
    }
    activeFilters.push({ field, value: searchInput.value.trim() });
    searchInput.value = "";
    renderChips();
    runSearch();
});

resetBtn.addEventListener("click", function () {
    loadContent();
});

filterChips.addEventListener("click", function (event) {
    const removeBtn = event.target.closest(".chip-remove");
    if (!removeBtn) return;
    activeFilters.splice(Number(removeBtn.dataset.index), 1);
    renderChips();
    runSearch();
});

typeRadios.forEach(radio => {
    radio.addEventListener("change", function () {
        typeRadios.forEach(otherRadio => otherRadio.closest(".type-radio").classList.remove("active"));
        radio.closest(".type-radio").classList.add("active");
        renderFiltered();
    });
});

// ברירת מחדל: "הכל" מסומן כ-active עם טעינת הדף
document.querySelector('input[name="typeFilter"]:checked').closest(".type-radio").classList.add("active");

addBtn.addEventListener("click", openCreateModal);

formType.addEventListener("change", toggleTypeFields);

contentBody.addEventListener("click", function (event) {
    const editBtn = event.target.closest(".edit-content");
    const deleteBtn = event.target.closest(".delete-content");
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