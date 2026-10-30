// ==========================================
// SUPABASE SETUP
// ==========================================
const supabaseUrl = 'https://emmxjqerlyqcayiskiqf.supabase.co';
const supabaseKey = 'sb_publishable_gAV4RbPZhMqLZ6B33xjvzA_KAPjbF7q';
const db = supabase.createClient(supabaseUrl, supabaseKey);

// DOM References for Auth
const loginScreen = document.getElementById("login-screen");
const mainLayout = document.getElementById("main-layout");
const logoutBtn = document.getElementById("logout-btn");
const loginForm = document.getElementById("login-form");
const guestBtn = document.getElementById("guest-btn");

// ==========================================
// AUTHENTICATION LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Check if a valid session already exists (e.g., user refreshed the page)
    const { data: { session } } = await db.auth.getSession();
    if (session) {
        showDashboard(true);
    }

    // 2. Handle Login Form
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value.trim().toLowerCase();
        const password = document.getElementById("login-password").value;
        
        // Supabase requires an email format, so we append a dummy domain to the username
        const email = `${username}@dashboard.local`;

        const { data, error } = await db.auth.signInWithPassword({ email, password });

        if (error) {
            alert("Login failed: " + error.message);
        } else {
            showDashboard(true);
        }
    });

    // 3. Handle Guest Mode
    guestBtn.addEventListener("click", () => {
        showDashboard(false);
    });

    // 4. Handle Logout
    logoutBtn.addEventListener("click", async () => {
        await db.auth.signOut();
        window.location.reload(); // Reload to clear all state and show login screen
    });

    // 5. The function that reveals the site
    function showDashboard(isAdmin) {
        loginScreen.style.display = "none";
        mainLayout.style.display = "grid";
        
        // Select ALL buttons that can add, edit, or delete
        const adminElements = document.querySelectorAll('.btn-primary, .delete-btn, .delete-game-btn, .delete-photo-btn, .delete-now-btn, #toggle-game-form, #toggle-upload-form, #toggle-now-form, #toggle-profile-form');
        
        if (!isAdmin) {
            // GUEST MODE: Hide all admin buttons
            adminElements.forEach(el => el.classList.add('guest-hidden'));
            
            // Setup the logout button as an "Exit Guest" button
            logoutBtn.classList.remove('guest-hidden');
            logoutBtn.textContent = "Exit Guest Mode";
            logoutBtn.style.background = "var(--muted)";
        } else {
            // ADMIN MODE: Show all buttons
            logoutBtn.classList.remove('guest-hidden');
            logoutBtn.textContent = "Log Out";
            logoutBtn.style.background = "#c0392b";
        }

        // Load all the database data
        loadProfile();
        loadPosts();
        loadGames();
        loadPhotos();
        loadNowItems(); 
        
        // Run UI functions
        updateNowSection();
    }

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
            const statusClass = game.status.toLowerCase().replace(" ", "-");
            return `
                <div class="game">
                    <div class="game-content">
                        <h3 class="game-title">${game.title}</h3>
                        <p class="game-goal">${game.goal}</p>
                    </div>
                    <div class="game-actions">
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

        document.querySelectorAll(".delete-game-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteGame(btn.dataset.id));
        });

        document.querySelectorAll(".status-select").forEach(select => {
            select.addEventListener("change", async (e) => {
                const newStatus = e.target.value;
                const gameId = e.target.dataset.id;
                const newClass = newStatus.toLowerCase().replace(" ", "-");
                e.target.className = `status-select ${newClass}`;
                await db.from('games').update({ status: newStatus }).eq('id', gameId);
            });
        });
    }

    if (gameForm) {
        gameForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const title = gameTitleInput.value.trim();
            const goal = gameGoalInput.value.trim();
            const status = document.getElementById("game-status").value;

            let hasError = false;
            if (!title) { gameTitleInput.classList.add("input-error"); hasError = true; }
            else { gameTitleInput.classList.remove("input-error"); }
            if (!goal) { gameGoalInput.classList.add("input-error"); hasError = true; }
            else { gameGoalInput.classList.remove("input-error"); }
            if (hasError) return;

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

            let hasError = false;
            if (!category) { nowCategoryInput.classList.add("input-error"); hasError = true; }
            else { nowCategoryInput.classList.remove("input-error"); }
            if (!content) { nowContentInput.classList.add("input-error"); hasError = true; }
            else { nowContentInput.classList.remove("input-error"); }
            if (hasError) return;

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
            const { data: uploadData, error: uploadError } = await db.storage.from('gallery').upload(fileName, file);

            if (uploadError) {
                alert("Error uploading image!");
                console.error(uploadError);
                uploadBtn.textContent = "Upload Photo";
                uploadBtn.disabled = false;
                return;
            }

            const { data: urlData } = db.storage.from('gallery').getPublicUrl(fileName);
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
    // 7. DYNAMIC PROFILE
    // ==========================================
    const profileForm = document.getElementById("profile-form");
    const toggleProfileBtn = document.getElementById("toggle-profile-form");

    if (toggleProfileBtn) {
        toggleProfileBtn.addEventListener("click", () => {
            if (profileForm.style.display === "none") {
                profileForm.style.display = "flex";
                toggleProfileBtn.textContent = "Cancel Edit";
                
                document.getElementById("edit-name").value = document.getElementById("display-name").textContent;
                document.getElementById("edit-handle").value = document.getElementById("display-handle").textContent;
                document.getElementById("edit-bio").value = document.getElementById("display-bio").textContent;
                document.getElementById("edit-location").value = document.getElementById("display-location").textContent;
                document.getElementById("edit-joined").value = document.getElementById("display-joined").textContent;
            } else {
                profileForm.style.display = "none";
                toggleProfileBtn.textContent = "Edit Profile";
            }
        });
    }

    async function loadProfile() {
        const { data: profile, error } = await db.from('profile').select('*').eq('id', 1).single();
        if (error) { console.error("Error loading profile:", error); return; }

        if (profile) {
            document.getElementById("display-name").textContent = profile.name;
            document.getElementById("display-handle").textContent = profile.handle;
            document.getElementById("display-bio").textContent = profile.bio;
            document.getElementById("display-location").textContent = profile.location;
            document.getElementById("display-joined").textContent = profile.joined_date;
        }
    }

    if (profileForm) {
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = document.getElementById("edit-name").value.trim();
            const handle = document.getElementById("edit-handle").value.trim();
            const bio = document.getElementById("edit-bio").value.trim();
            const location = document.getElementById("edit-location").value.trim();
            const joined = document.getElementById("edit-joined").value.trim();

            const { error } = await db.from('profile').update({ 
                name, handle, bio, location, joined_date: joined 
            }).eq('id', 1);

            if (error) {
                alert("Error saving profile!");
                console.error(error);
            } else {
                profileForm.style.display = "none";
                toggleProfileBtn.textContent = "Edit Profile";
                await loadProfile();
            }
        });
    }

});