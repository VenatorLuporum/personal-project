// ---------- Microblog: state ----------
const STORAGE_KEY = "dashboard-microblog-posts";

let posts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ---------- DOM references ----------
const postForm = document.getElementById("post-form");
const postInput = document.getElementById("post-input");
const charCount = document.getElementById("char-count");
const postBtn = document.getElementById("post-btn");
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
            '<p class="empty-state">No posts yet. Say something above! ✍️</p>';
        return;
    }

    const sorted = [...posts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    postsContainer.innerHTML = sorted
        .map(
            (post) => `
        <article class="tweet" data-id="${post.id}">
            <div class="tweet-avatar" aria-hidden="true">You</div>
            <div class="tweet-body">
                <div class="tweet-header">
                    <span class="tweet-name">You</span>
                    <span class="tweet-handle">@me</span>
                    <span class="tweet-dot">·</span>
                    <time class="tweet-date">${formatDate(post.date)}</time>
                </div>
                <p class="tweet-text">${escapeHTML(post.text)}</p>
                <div class="tweet-actions">
                    <button class="tweet-action edit-btn" data-id="${post.id}">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        <span>Edit</span>
                    </button>
                    <button class="tweet-action tweet-action-danger delete-btn" data-id="${post.id}">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
                        <span>Delete</span>
                    </button>
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
    resetComposer();
});

// ---------- Composer: auto-grow, counter, button state ----------
function resetComposer() {
    postInput.style.height = "auto";
    postInput.style.height = postInput.scrollHeight + "px";
    updateCharCount();
}

function updateCharCount() {
    const len = postInput.value.length;
    charCount.textContent = `${len} / 280`;
    charCount.classList.toggle("warning", len > 250);
    postBtn.disabled = len === 0 || len > 280;
}

postInput.addEventListener("input", () => {
    postInput.style.height = "auto";
    postInput.style.height = postInput.scrollHeight + "px";
    updateCharCount();
});

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
    const postEl = document.querySelector(`.tweet[data-id="${id}"]`);
    if (!post || !postEl) return;

    postEl.classList.add("editing");
    postEl.innerHTML = `
        <div class="tweet-avatar" aria-hidden="true">You</div>
        <div class="tweet-body">
            <div class="edit-form">
                <textarea rows="3" maxlength="280">${escapeHTML(post.text)}</textarea>
                <div class="edit-actions">
                    <button class="btn btn-text cancel-btn">Cancel</button>
                    <button class="btn btn-primary save-btn">Save</button>
                </div>
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
    if (!confirm("Delete this post? This can't be undone.")) return;
    posts = posts.filter((p) => p.id !== id);
    savePosts();
    renderPosts();
}

// ---------- Initial render ----------
renderPosts();
resetComposer();