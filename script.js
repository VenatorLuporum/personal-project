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