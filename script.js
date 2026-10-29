// ==========================================
// 0. SUPABASE SETUP
// ==========================================
const supabaseUrl = 'https://emmxjqerlyqcayiskiqf.supabase.co';
const supabaseKey = 'sb_publishable_gAV4RbPZhMqLZ6B33xjvzA_KAPjbF7q';
const db = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. DYNAMIC "NOW" SECTION
    // ==========================================
    function updateNowSection() {
        const dateEl = document.getElementById("current-date");
        if (dateEl) {
            const today = new Date();
            const options = { month: 'long', day: 'numeric', year: 'numeric' };
            dateEl.textContent = today.toLocaleDateString('en-US', options);
        }

        const greetingEl = document.getElementById("greeting");
        if (greetingEl) {
            const hour = new Date().getHours();
            let greetingText = "📌 Now"; 
            if (hour < 12) greetingText = "🌅 Good Morning";
            else if (hour < 18) greetingText = "☀️ Good Afternoon";
            else greetingText = "🌙 Good Evening";
            greetingEl.textContent = greetingText;
        }
    }
    updateNowSection();

    // ==========================================
    // 2. LIVE PROFILE STATS
    // ==========================================
    function updateStats() {
        const photoCount = document.querySelectorAll(".gallery-item").length;
        const photoEl = document.getElementById("stat-photos");
        if (photoEl) photoEl.textContent = photoCount;

        const gameCount = document.querySelectorAll(".game").length;
        const gameEl = document.getElementById("stat-games");
        if (gameEl) gameEl.textContent = gameCount;
    }
    updateStats();

    // ==========================================
    // 3. DARK MODE TOGGLE
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
    // 4. LIGHTBOX
    // ==========================================
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
        const galleryItems = document.querySelectorAll(".gallery-item");
        const lightboxImg = document.getElementById("lightbox-img");
        const closeBtn = document.querySelector(".lightbox-close");

        galleryItems.forEach((img) => {
            img.addEventListener("click", () => {
                lightboxImg.src = img.src;
                lightbox.classList.add("active");
            });
        });
        if(closeBtn) closeBtn.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lightbox.classList.contains("active")) closeLightbox();
        });
        function closeLightbox() {
            lightbox.classList.remove("active");
            setTimeout(() => { lightboxImg.src = ""; }, 200); 
        }
    }

    // ==========================================
    // 5. CLOUD MICROBLOG (SUPABASE)
    // ==========================================
    const postForm = document.getElementById("post-form");
    const postInput = document.getElementById("post-input");
    const charCount = document.getElementById("char-count");
    const postBtn = document.getElementById("post-btn");
    const postsContainer = document.getElementById("posts-container");

    // Fetch and display posts
    async function loadPosts() {
        const { data: posts, error } = await db
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false }); // Newest first

        if (error) {
            console.error("Error loading posts:", error);
            postsContainer.innerHTML = '<p class="empty-state">Failed to load posts.</p>';
            return;
        }

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="empty-state">No posts yet. Say something above!</p>';
            return;
        }

        // Format dates and render HTML
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
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        // Attach delete listeners
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deletePost(btn.dataset.id));
        });
    }

    // Add a new post
    if (postForm) {
        postForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const text = postInput.value.trim();
            if (!text) return;

            postBtn.textContent = "Posting...";
            postBtn.disabled = true;

            const { error } = await db.from('posts').insert([{ content: text }]);

            if (error) {
                alert("Error saving post!");
                console.error(error);
            } else {
                postInput.value = "";
                resetComposer();
                await loadPosts(); // Reload the feed
            }

            postBtn.textContent = "Post";
        });

        // Composer logic
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
    }

    // Delete a post
    async function deletePost(id) {
        if (!confirm("Delete this post from the cloud?")) return;

        const { error } = await db.from('posts').delete().eq('id', id);
        
        if (error) {
            alert("Error deleting post");
            console.error(error);
        } else {
            await loadPosts(); // Reload the feed
        }
    }

    // Initial Load
    loadPosts();
});