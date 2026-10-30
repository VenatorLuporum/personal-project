// ==========================================
// SUPABASE SETUP
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
    // 3. LIGHTBOX (Global function)
    // ==========================================
    window.openLightbox = function(url) {
        const lightbox = document.getElementById("lightbox");
        const lightboxImg = document.getElementById("lightbox-img");
        if (lightbox && lightboxImg) {
            lightboxImg.src = url;
            lightbox.classList.add("active");
        }
    }

    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
        const closeBtn = document.querySelector(".lightbox-close");
        if(closeBtn) closeBtn.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lightbox.classList.contains("active")) closeLightbox();
        });
        function closeLightbox() {
            lightbox.classList.remove("active");
            setTimeout(() => { document.getElementById("lightbox-img").src = ""; }, 200); 
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

        

        const postStat = document.getElementById("stat-posts");
        if (postStat) postStat.textContent = posts.length;

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
    const gameTitleInput = document.getElementById("game-title");
    const gameGoalInput = document.getElementById("game-goal");

    if (toggleGameFormBtn) {
        toggleGameFormBtn.addEventListener("click", () => {
            gameForm.style.display = gameForm.style.display === "none" ? "flex" : "none";
            // Clear errors when opening the form
            gameTitleInput.classList.remove("input-error");
            gameGoalInput.classList.remove("input-error");
        });
    }

    async function loadGames() {
        const { data: games, error } = await db.from('games').select('*').order('created_at', { ascending: true });
        if (error) { console.error(error); return; }

        const gameStat = document.getElementById("stat-games");
        if (gameStat) gameStat.textContent = games.length;
        
        if (games.length === 0) {
            gamesContainer.innerHTML = '<p class="empty-state">No games logged yet. Click "+ Add Game"!</p>';
            return;
        }

        gamesContainer.innerHTML = games.map(game => {
            // Format the class name (e.g., "On Break" -> "on-break")
            const statusClass = game.status.toLowerCase().replace(" ", "-");
            
            return `
                <div class="game">
                    <div class="game-content">
                        <h3 class="game-title">${game.title}</h3>
                        <p class="game-goal">${game.goal}</p>
                    </div>
                    <div class="game-actions">
                        <!-- CHANGED: Now a select dropdown -->
                        <select class="status-select ${statusClass}" data-id="${game.id}">
                            <option value="Playing" ${game.status === 'Playing' ? 'selected' : ''}>Playing</option>
                            <option value="Ongoing" ${game.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
                            <option value="On Break" ${game.status === 'On Break' ? 'selected' : ''}>On Break</option>
                        </select>
                        
                        <button class="delete-game-btn" data-id="${game.id}" title="Delete Game">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        // Attach Delete listeners
        document.querySelectorAll(".delete-game-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteGame(btn.dataset.id));
        });

        // Attach Status Change listeners
        document.querySelectorAll(".status-select").forEach(select => {
            select.addEventListener("change", async (e) => {
                const newStatus = e.target.value;
                const gameId = e.target.dataset.id;
                const newClass = newStatus.toLowerCase().replace(" ", "-");

                // 1. Instantly update the color in the UI so it feels snappy
                e.target.className = `status-select ${newClass}`;

                // 2. Save to the database
                const { error } = await db.from('games').update({ status: newStatus }).eq('id', gameId);
                if (error) {
                    alert("Error updating status!");
                    console.error(error);
                }
            });
        });
    }

    if (gameForm) {
        gameForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const title = gameTitleInput.value.trim();
            const goal = gameGoalInput.value.trim();
            const status = document.getElementById("game-status").value;

            // Validation: Check if fields are empty
            let hasError = false;
            if (!title) {
                gameTitleInput.classList.add("input-error");
                hasError = true;
            } else {
                gameTitleInput.classList.remove("input-error");
            }

            if (!goal) {
                gameGoalInput.classList.add("input-error");
                hasError = true;
            } else {
                gameGoalInput.classList.remove("input-error");
            }

            // If empty, stop the submission
            if (hasError) return;

            // If everything is filled out, submit to database
            await db.from('games').insert([{ title, goal, status }]);
            
            gameForm.reset();
            gameForm.style.display = "none"; 
            await loadGames();
        });
    }

    async function deleteGame(id) {
        if (!confirm("Remove this game from your log?")) return;
        await db.from('games').delete().eq('id', id);
        await loadGames();
    }

        // ==========================================
    // 5.5 DYNAMIC NOW PAGE
    // ==========================================
    const nowContainer = document.getElementById("now-container");
    const nowForm = document.getElementById("now-form");
    const toggleNowFormBtn = document.getElementById("toggle-now-form");
    const nowCategoryInput = document.getElementById("now-category");
    const nowContentInput = document.getElementById("now-content");

    if (toggleNowFormBtn) {
        toggleNowFormBtn.addEventListener("click", () => {
            nowForm.style.display = nowForm.style.display === "none" ? "flex" : "none";
            // Clear errors
            nowCategoryInput.classList.remove("input-error");
            nowContentInput.classList.remove("input-error");
        });
    }

    async function loadNowItems() {
        const { data: items, error } = await db.from('now_items').select('*').order('created_at', { ascending: true });
        if (error) { console.error(error); return; }

        if (items.length === 0) {
            nowContainer.innerHTML = '<li class="empty-state">Nothing here yet. Click "+ Add Item"!</li>';
            return;
        }

        nowContainer.innerHTML = items.map(item => `
            <li>
                <div class="now-item-text">
                    <strong>${item.category}:</strong> ${item.content}
                </div>
                <button class="delete-now-btn" data-id="${item.id}" title="Delete Item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
            </li>
        `).join("");

        document.querySelectorAll(".delete-now-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteNowItem(btn.dataset.id));
        });
    }

    if (nowForm) {
        nowForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const category = nowCategoryInput.value.trim();
            const content = nowContentInput.value.trim();

            // Validation
            let hasError = false;
            if (!category) { nowCategoryInput.classList.add("input-error"); hasError = true; }
            else { nowCategoryInput.classList.remove("input-error"); }

            if (!content) { nowContentInput.classList.add("input-error"); hasError = true; }
            else { nowContentInput.classList.remove("input-error"); }

            if (hasError) return;

            // Save to DB
            await db.from('now_items').insert([{ category, content }]);
            
            nowForm.reset();
            nowForm.style.display = "none";
            await loadNowItems();
        });
    }

    async function deleteNowItem(id) {
        if (!confirm("Remove this item from your 'Now' page?")) return;
        await db.from('now_items').delete().eq('id', id);
        await loadNowItems();
    }
    // ==========================================
    // 6. CLOUD GALLERY
    // ==========================================
    const galleryContainer = document.getElementById("gallery-container");
    const uploadForm = document.getElementById("upload-form");
    const toggleUploadBtn = document.getElementById("toggle-upload-form");
    const uploadBtn = document.getElementById("upload-btn");

    if (toggleUploadBtn) {
        toggleUploadBtn.addEventListener("click", () => {
            uploadForm.style.display = uploadForm.style.display === "none" ? "flex" : "none";
        });
    }

    async function loadPhotos() {
        const { data: photos, error } = await db.from('photos').select('*').order('created_at', { ascending: false });
        if (error) { console.error(error); return; }
        
        // --- FIX: Update Photo Counter dynamically ---
        const photoStat = document.getElementById("stat-photos");
        if (photoStat) photoStat.textContent = photos.length;

        if (photos.length === 0) {
            galleryContainer.innerHTML = '<p class="empty-state" style="grid-column: 1 / -1;">No photos yet. Click "+ Upload"!</p>';
            return;
        }

        galleryContainer.innerHTML = photos.map(photo => `
            <div class="gallery-item-wrapper">
                <img src="${photo.image_url}" alt="Gallery photo" class="gallery-item" onclick="openLightbox('${photo.image_url}')">
                <button class="delete-photo-btn" data-id="${photo.id}" data-url="${photo.image_url}" title="Delete Photo">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
        `).join("");

        document.querySelectorAll(".delete-photo-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                deletePhoto(btn.dataset.id, btn.dataset.url);
            });
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const file = document.getElementById("image-file").files[0];
            if (!file) return;

            uploadBtn.textContent = "Uploading...";
            uploadBtn.disabled = true;

            const fileName = `${Date.now()}-${file.name.replace(/\s/g, '')}`;
            const { data: uploadData, error: uploadError } = await db.storage
                .from('gallery')
                .upload(fileName, file);

            if (uploadError) {
                alert("Error uploading image!");
                console.error(uploadError);
                uploadBtn.textContent = "Upload Photo";
                uploadBtn.disabled = false;
                return;
            }

            const { data: urlData } = db.storage
                .from('gallery')
                .getPublicUrl(fileName);

            await db.from('photos').insert([{ image_url: urlData.publicUrl }]);

            uploadForm.reset();
            uploadForm.style.display = "none";
            uploadBtn.textContent = "Upload Photo";
            uploadBtn.disabled = false;
            
            await loadPhotos();
        });
    }

    async function deletePhoto(id, url) {
        if (!confirm("Delete this photo forever?")) return;

        await db.from('photos').delete().eq('id', id);

        const fileName = url.split('/').pop(); 
        await db.storage.from('gallery').remove([fileName]);

        await loadPhotos();
    }

    // ==========================================
    // INITIAL LOADS
    // ==========================================
    loadPosts();
    loadGames();
    loadPhotos();
    loadNowItems();
});