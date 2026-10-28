// ---------- Gallery Carousel ----------
const galleryTrack = document.getElementById("gallery-track");
const prevBtn = document.getElementById("gallery-prev");
const nextBtn = document.getElementById("gallery-next");

// Scroll amount (roughly the width of one image + the gap)
const scrollAmount = 180; 

prevBtn.addEventListener("click", () => {
    galleryTrack.scrollBy({ left: -scrollAmount, behavior: "smooth" });
});

nextBtn.addEventListener("click", () => {
    galleryTrack.scrollBy({ left: scrollAmount, behavior: "smooth" });
});

// Optional: Hide arrows if there's nothing to scroll (e.g., only 2 images)
function updateArrowVisibility() {
    const maxScrollLeft = galleryTrack.scrollWidth - galleryTrack.clientWidth;
    
    // If there's no scrolling needed, hide both
    if (maxScrollLeft <= 0) {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
        return;
    } else {
        // Only show if on desktop
        if (window.innerWidth > 768) {
            prevBtn.style.display = "flex";
            nextBtn.style.display = "flex";
        }
    }

    // Hide left arrow if at the very start
    if (galleryTrack.scrollLeft <= 0) {
        prevBtn.style.opacity = "0.3";
        prevBtn.style.pointerEvents = "none";
    } else {
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "auto";
    }

    // Hide right arrow if at the very end
    if (galleryTrack.scrollLeft >= maxScrollLeft - 1) {
        nextBtn.style.opacity = "0.3";
        nextBtn.style.pointerEvents = "none";
    } else {
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "auto";
    }
}

// Run on load, on scroll, and on resize
galleryTrack.addEventListener("scroll", updateArrowVisibility);
window.addEventListener("resize", updateArrowVisibility);
// Initial check
setTimeout(updateArrowVisibility, 100); 
// ---------- Lightbox Functionality ----------
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.querySelector(".lightbox-close");

// 1. Open lightbox when an image is clicked
galleryItems.forEach((img) => {
    img.addEventListener("click", () => {
        lightboxImg.src = img.src; // Copy the image source
        lightbox.classList.add("active"); // Show the overlay
    });
});

// 2. Close lightbox when the 'X' is clicked
closeBtn.addEventListener("click", closeLightbox);

// 3. Close lightbox when clicking anywhere on the dark background
lightbox.addEventListener("click", (e) => {
    // Only close if the user clicked the background, not the image itself
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// 4. Close lightbox when pressing the 'Escape' key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
    }
});

function closeLightbox() {
    lightbox.classList.remove("active");
    // Clear the image source after closing to prevent flashing next time
    setTimeout(() => {
        lightboxImg.src = "";
    }, 200); 
}