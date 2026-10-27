// ---------- Microblog: state ----------
const STORAGE_KEY = "dashboard-microblog-posts";

// Load posts from localStorage (or start empty)
let posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ---------- DOM references ----------
const postForm = document.getElementById("post-form");
const postInput = document.getElementById("post-input");
const charCount = document.getElementById("char-count");
const postsContainer = document.getElementById("posts-container");

// ---------- Helpers ----------
function savePosts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ---------- Rendering ----------
function renderPosts() {
    if (posts.length === 0) {
        postsContainer.innerHTML =
            '<p class="empty-state">No posts yet. Write your first one above! ✍️</p>';
        return;
    }

    // Newest first
    const sorted = [...posts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    postsContainer.innerHTML = sorted
        .map(
            (post) => `
        <article class="post-item" data-id="${post.id}">
            <p class="post-text">${escapeHTML(post.text)}</p>
            <div class="post-meta">
                <time class="post-date">${formatDate(post.date)}</time>
                <div class="post-actions">
                    <button class="btn btn-text edit-btn" data-id="${post.id}">Edit</button>
                    <button class="btn btn-text btn-danger delete-btn" data-id="${post.id}">Delete</button>
                </div>
            </div>
        </article>
    `
        )
        .join("");

    attachPostListeners();
}

// ---------- Add ----------
postForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = postInput.value.trim();
    if (!text) return;

    posts.push({
        id: Date.now().toString(),
        text: text,
        date: new Date().toISOString(),
    });

    savePosts();
    renderPosts();

    postInput.value = "";
    updateCharCount();
});

// ---------- Character counter ----------
function updateCharCount() {
    const len = postInput.value.length;
    charCount.textContent = `${len} / 280`;
    charCount.classList.toggle("warning", len > 250);
}

postInput.addEventListener("input", updateCharCount);

// ---------- Edit & Delete ----------
function attachPostListeners() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => startEdit(btn.dataset.id));
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => deletePost(btn.dataset.id));
    });
}

function startEdit(id) {
    const post = posts.find((p) => p.id === id);
    const postEl = document.querySelector(`.post-item[data-id="${id}"]`);
    if (!post || !postEl) return;

    postEl.classList.add("editing");
    postEl.innerHTML = `
        <div class="edit-form">
            <textarea rows="3" maxlength="280">${escapeHTML(post.text)}</textarea>
            <div class="edit-actions">
                <button class="btn btn-text cancel-btn">Cancel</button>
                <button class="btn btn-primary save-btn">Save</button>
            </div>
        </div>
    `;

    const textarea = postEl.querySelector("textarea");
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    postEl.querySelector(".save-btn").addEventListener("click", () => {
        const newText = textarea.value.trim();
        if (!newText) return;

        post.text = newText;
        savePosts();
        renderPosts();
    });

    postEl.querySelector(".cancel-btn").addEventListener("click", renderPosts);
}

function deletePost(id) {
    const confirmed = confirm("Delete this post? This can't be undone.");
    if (!confirmed) return;

    posts = posts.filter((p) => p.id !== id);
    savePosts();
    renderPosts();
}

// ---------- Initial render ----------
renderPosts();
