const form = document.getElementById("post-form");
const postsContainer = document.getElementById("posts-container");
const searchInput = document.getElementById("searchInput");
const authorSelect = document.getElementById("authorSelect");
let allPosts = [];

// GET all posts from server and render to DOM  
async function getPosts() {
    const res = await fetch("/posts");
    allPosts = await res.json();
    populateAuthors();
    renderFeed();
}
// Clear DOM and render each post to DOM
function renderPosts(posts) {
    postsContainer.innerHTML = "";
    if (posts.length ===0){
        document.getElementById("not-found").classList.remove("hidden");
        return;
    }
    document.getElementById("not-found").classList.add("hidden");
    posts.forEach(renderPost);
}

// Render a single post to DOM
function renderPost(post) {
    const div = document.createElement("div");
    div.id = `post-${post._id}`;
    div.dataset.title = post.title;
    div.dataset.content = post.content;
    div.dataset.author = post.author;
    const dateStr = post.updatedAt !== post.createdAt 
    ? new Date(post.updatedAt).toLocaleDateString('he-IL')
    : new Date(post.createdAt).toLocaleDateString('he-IL');
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>${post.title}</h3>
                <small>${post.author}  <span><i class="fa-regular fa-user fa-sm"></i></span></small>
        </div>
        <p>${post.content}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <small>
                ${dateStr}
                ${post.updatedAt !== post.createdAt ? ' (עודכן) ' : ''}
            </small>
            <button id="edit-btn" onclick="editPost('${post._id}')"><i class="fa-regular fa-pen-to-square"></i></button>
            <button id="delete-btn" onclick="deletePost('${post._id}')"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `;
    postsContainer.appendChild(div);
}

//DELETE POST
let postToDelete = null;

async function deletePost(postId) {
    postToDelete = postId;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

document.getElementById('confirmDelete').addEventListener('click', async function() {
    bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    const res = await fetch(`/posts/${postToDelete}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
        allPosts = allPosts.filter(post => post._id !== postToDelete);
        populateAuthors();
        renderFeed();
    }
    else {
        alert("תקלה במחיקת הפוסט")
    }
    postToDelete = null;
});

//EDIT POST
let postToEdit = null;

async function editPost(postId) {
    postToEdit = postId;
    const postDiv = document.getElementById(`post-${postId}`); 
    //modal form fields load current field values
    document.getElementById('editTitle').value = postDiv.dataset.title;
    document.getElementById('editAuthor').value = postDiv.dataset.author;
    document.getElementById('editContent').value = postDiv.dataset.content;
    new bootstrap.Modal(document.getElementById('editModal')).show();
}
document.getElementById('edit-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const postDiv = document.getElementById(`post-${postToEdit}`);

    if (document.getElementById("editTitle").value === postDiv.dataset.title &&
    document.getElementById("editAuthor").value === postDiv.dataset.author && 
    document.getElementById("editContent").value === postDiv.dataset.content) {
        alert("לא בוצעו שינויים");
        return;
    }

    bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();

    const res= await fetch(`/posts/${postToEdit}`, {
        method: `PUT`,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            title: document.getElementById('editTitle').value,
            author: document.getElementById('editAuthor').value,
            content: document.getElementById('editContent').value,
        })
    });
    const result = await res.json();
    if (result.success){
        getPosts();
    }
    else {
        alert("תקלה בעדכון הפוסט");
    }   
    postToEdit=null;
});

//SEARCH & FILTER
function renderFeed() {
    const searchText = searchInput.value.trim();
    const selectedAuthor = authorSelect.value;

    const filtered = allPosts.filter(post => {
        const matchesSearch = post.title.includes(searchText) || post.content.includes(searchText);
        const matchesAuthor = selectedAuthor === "" || post.author === selectedAuthor;
        return matchesSearch && matchesAuthor;
    });

    renderPosts(filtered);
}

searchInput.addEventListener("input", renderFeed);
authorSelect.addEventListener("change", renderFeed);

function populateAuthors() {
    const selected = authorSelect.value;
    const authors = [...new Set(allPosts.map(post => post.author))];
    authorSelect.innerHTML = `<option value="">כל הכותבים</option>`;
    authors.forEach(author => {
        authorSelect.innerHTML += `<option value="${author}">${author}</option>`;
    });
    authorSelect.value = authors.includes(selected) ? selected : "";
}
// POST new post to server
form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const author = document.getElementById("author").value;

    const res = await fetch("/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, author })
    });

    const data = await res.json();
    if (data.success) {
        allPosts.push(data.post);
        populateAuthors();
        renderFeed();
        form.reset();
    }
});
//render posts to dom on load
getPosts();