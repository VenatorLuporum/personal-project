// ==========================================
// SUPABASE SETUP
// ==========================================
const supabaseUrl = 'https://emmxjqerlyqcayiskiqf.supabase.co';
const supabaseKey = 'sb_publishable_gAV4RbPZhMqLZ6B33xjvzA_KAPjbF7q';
const db = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. DARK MODE TOGGLE
    // ==========================================
    const themeToggleBtn = document.getElementById("theme-toggle");
    const body = document.body;
    
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        if(themeToggleBtn) themeToggleBtn.textContent = "☀️ Light Mode";
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            if (body.classList.contains("dark-mode")) {
                themeToggleBtn.textContent = "☀️ Light Mode";
                localStorage.setItem("theme", "dark");
            } else {
                themeToggleBtn.textContent = "🌙 Dark Mode";
                localStorage.setItem("theme", "light");
            }
        });
    }

    // ==========================================
    // 2. MICROBLOG LOGIC
    // ==========================================
    const postForm = document.getElementById("post-form");
    const postInput = document.getElementById("post-input");
    const charCount = document.getElementById("char-count");
    const postBtn = document.getElementById("post-btn");
    const postsContainer = document.getElementById("posts-container");

    async function loadPosts() {
        const { data: posts, error } = await db.from('posts').select('*').order('created_at', { ascending: false });
        if (error) { console.error(error); return; }

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="empty-state">No posts yet. Say something above!</p>';
            return;
        }

        postsContainer.innerHTML = posts.map(post => {
            const date = new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            return `
                <article class="tweet">
                    <div class="tweet-avatar" aria-hidden="true">You</div>
                    <div class="tweet-body">
                        <div class="tweet-header">
                            <span class="tweet-name">You</span>
                            <span class="tweet-handle">@me</span>
                            <span class="tweet-dot">·</span>
                            <time class="tweet-date">${date}</time>
                        </div>
                        <p class="tweet-text">${post.content}</p>
                        <div class="tweet-actions">
                            <button class="tweet-action tweet-action-danger delete-btn" data-id="${post.id}">
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deletePost(btn.dataset.id));
        });
    }

    if (postForm) {
        postForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const text = postInput.value.trim();
            if (!text) return;

            postBtn.textContent = "Posting...";
            postBtn.disabled = true;

            await db.from('posts').insert([{ content: text }]);
            
            postInput.value = "";
            postInput.style.height = "auto";
            charCount.textContent = "0 / 280";
            postBtn.textContent = "Post";
            await loadPosts();
        });

        // Auto-grow textarea and update character count
        postInput.addEventListener("input", () => {
            postInput.style.height = "auto";
            postInput.style.height = postInput.scrollHeight + "px";
            const len = postInput.value.length;
            charCount.textContent = `${len} / 280`;
            postBtn.disabled = len === 0 || len > 280;
        });
    }

    async function deletePost(id) {
        if (!confirm("Delete this post?")) return;
        await db.from('posts').delete().eq('id', id);
        await loadPosts();
    }

    // Initial Load
    loadPosts();
});