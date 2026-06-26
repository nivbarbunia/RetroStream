const form = document.getElementById("post-form");
const postsContainer = document.getElementById("posts-container");

// GET all posts from server and render them to DOM
async function getPosts() {
    const res = await fetch("/posts");
    const posts = await res.json();
    posts.forEach(renderPost);
}

// Render a single post to DOM
function renderPost(post) {
    const div = document.createElement("div");
    div.id = `post-${post._id}`;
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>${post.title}</h3>
                <small>${post.author}  <span><i class="fa-regular fa-user fa-sm"></i></span></small>
        </div>
        <p>${post.content}</p>
        <button onclick="deletePost('${post._id}')"><i class="fa-solid fa-trash-can"></i>
        </button>
    `;
    postsContainer.appendChild(div);
}

//DELETE POST
let postToDelete = null;

async function deletePost(postId) {
    postToDelete = postId;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

document.getElementById('confirmDelete').addEventListener('click', async function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    modal.hide();
    const res = await fetch(`/posts/${postToDelete}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
        document.getElementById(`post-${postToDelete}`).remove();
    }
    else {
        alert("תקלה במחיקת הפוסט")
    }
    postToDelete = null;
});


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
        renderPost(data.post);
        form.reset();
    }
});
//render posts to dom on load
getPosts();