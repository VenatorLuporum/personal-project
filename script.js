// ==========================================
// SUPABASE SETUP
// ==========================================
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';
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
    // 2. DARK MODE TOGGLE
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
    // 3. LIGHTBOX
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
    // 4. CLOUD MICROBLOG
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

    // ==========================================
    // 5. CLOUD GAMING LOG
    // ==========================================
    const gamesContainer = document.getElementById("games-container");
    const gameForm = document.getElementById("game-form");
    const toggleGameFormBtn = document.getElementById("toggle-game-form");

    // Toggle form visibility
    if (toggleGameFormBtn) {
        toggleGameFormBtn.addEventListener("click", () => {
            gameForm.style.display = gameForm.style.display === "none" ? "flex" : "none";
        });
    }

    async function loadGames() {
        const { data: games, error } = await db.from('games').select('*').order('created_at', { ascending: true });
        
        if (error) { console.error(error); return; }
        
        if (games.length === 0) {
            gamesContainer.innerHTML = '<p class="empty-state">No games logged yet. Click "+ Add Game"!</p>';
            return;
        }

        gamesContainer.innerHTML = games.map(game => {
            // Format status class (e.g. "On Break" -> "status-break")
            const statusClass = game.status.toLowerCase().replace(" ", "-");
            
            return `
                <div class="game">
                    <div class="game-content">
                        <h3 class="game-title">${game.title}</h3>
                        <p class="game-goal">${game.goal || "No goal set."}</p>
                    </div>
                    <div class="game-actions">
                        <span class="status status-${statusClass}">${game.status}</span>
                        <button class="delete-game-btn" data-id="${game.id}" title="Delete Game">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        // Attach delete listeners
        document.querySelectorAll(".delete-game-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteGame(btn.dataset.id));
        });
    }

    // Add Game
    if (gameForm) {
        gameForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = document.getElementById("game-title").value.trim();
            const goal = document.getElementById("game-goal").value.trim();
            const status = document.getElementById("game-status").value;

            await db.from('games').insert([{ title, goal, status }]);
            
            gameForm.reset();
            gameForm.style.display = "none"; // Hide form after saving
            await loadGames();
        });
    }

    // Delete Game
    async function deleteGame(id) {
        if (!confirm("Remove this game from your log?")) return;
        await db.from('games').delete().eq('id', id);
        await loadGames();
    }

    // Initial Loads
    loadPosts();
    loadGames();
});