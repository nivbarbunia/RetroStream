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
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <small>${post.author}</small>
        <button onclick="deletePost('${post._id}')">מחק</button>
    `;
    postsContainer.appendChild(div);
}

async function deletePost(postId) {
    if(!confirm("למחוק את הפוסט?")) return;
    const res = await fetch(`/posts/${postId}`, {
        method: "DELETE"
    });
    const result = await res.json();
    if (result.success){
        document.getElementById(`post-${postId}`).remove();
    }
    else {
        alert("תקלה במחיקת הפוסט")
    }
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
        renderPost(data.post);
        form.reset();
    }
});
//render posts to dom on load
getPosts();