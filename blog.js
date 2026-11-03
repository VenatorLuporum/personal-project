const supabaseUrl = 'https://emmxjqerlyqcayiskiqf.supabase.co';
const supabaseKey = 'sb_publishable_gAV4RbPZhMqLZ6B33xjvzA_KAPjbF7q';
const db = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
    const blogForm = document.getElementById("blog-form");
    const blogTitle = document.getElementById("blog-title");
    const blogContent = document.getElementById("blog-content");
    const blogCover = document.getElementById("blog-cover");
    const publishBtn = document.getElementById("publish-btn");

    if (blogForm) {
        blogForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const title = blogTitle.value.trim();
            const content = blogContent.innerHTML.trim();
            const file = blogCover.files[0];

            // 1. Validation (Must have title, body text, and a cover photo)
            if (!title || !content || !file) {
                alert("Please fill out all fields and select a cover photo.");
                return;
            }

            publishBtn.textContent = "Publishing to the cloud...";
            publishBtn.disabled = true;

            try {
                // 2. Upload the Cover Image
                const fileName = `cover-${Date.now()}-${file.name.replace(/\s/g, '')}`;
                const { data: uploadData, error: uploadError } = await db.storage
                    .from('blog-covers')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // 3. Get the Public URL for the image
                const { data: urlData } = db.storage
                    .from('blog-covers')
                    .getPublicUrl(fileName);

                // 4. Save the Blog to the Database
                const { error: dbError } = await db.from('blogs').insert([{
                    title: title,
                    content: content, // This contains the rich HTML (bold, lists, etc.)
                    cover_image_url: urlData.publicUrl
                }]);

                if (dbError) throw dbError;

                alert("Blog published successfully!");
                window.location.href = "index.html"; // Go back to dashboard

            } catch (error) {
                console.error(error);
                alert("Error publishing blog: " + error.message);
                publishBtn.textContent = "Publish Blog";
                publishBtn.disabled = false;
            }
        });
    }
});