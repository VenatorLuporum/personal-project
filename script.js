// Wait for the HTML to fully load before running any code
document.addEventListener("DOMContentLoaded", () => {
     // ---------- 1. Dynamic "Now" Page ----------
    function updateNowSection() {
        // A. Update the Date
        const dateEl = document.getElementById("current-date");
        if (dateEl) {
            const today = new Date();
            // Formats as: October 28, 2026
            const options = { month: 'long', day: 'numeric', year: 'numeric' };
            dateEl.textContent = today.toLocaleDateString('en-US', options);
        }

        // B. Update the Greeting based on time of day
        const greetingEl = document.getElementById("greeting");
        if (greetingEl) {
            const hour = new Date().getHours();
            let greetingText = "📌 Now"; // Default fallback

            if (hour < 12) {
                greetingText = "🌅 Good Morning";
            } else if (hour < 18) {
                greetingText = "☀️ Good Afternoon";
            } else {
                greetingText = "🌙 Good Evening";
            }
            
            greetingEl.textContent = greetingText;
        }
    }

    // Run the function
    updateNowSection();
    // ---------- 1. Live Profile Stats ----------
    function updateStats() {
        // Count the Photos
        const photoCount = document.querySelectorAll(".gallery-item").length;
        const photoEl = document.getElementById("stat-photos");
        if (photoEl) photoEl.textContent = photoCount;

        // Count the Games (Counts ALL games: playing + finished)
        const gameCount = document.querySelectorAll(".game").length;
        const gameEl = document.getElementById("stat-games");
        if (gameEl) gameEl.textContent = gameCount;
        
        // Log to console so you can see if it's working in DevTools
        console.log(`Stats updated: ${photoCount} photos, ${gameCount} games.`);
    }

    // Run the counter immediately
    updateStats();


    // ---------- 2. Lightbox Functionality ----------
    // We wrap this in an 'if' statement so it doesn't crash the page 
    // if you ever remove the lightbox HTML.
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

        closeBtn.addEventListener("click", closeLightbox);
        
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lightbox.classList.contains("active")) {
                closeLightbox();
            }
        });

        function closeLightbox() {
            lightbox.classList.remove("active");
            setTimeout(() => { lightboxImg.src = ""; }, 200); 
        }
    }
});