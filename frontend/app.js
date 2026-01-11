const API_BASE_URL =
  "https://api-presshub-dkfehqasd0gygpgr.swedencentral-01.azurewebsites.net/api/";

// Fetch the feed on load
document.addEventListener("DOMContentLoaded", fetchFeed);

// Handle Upload
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("statusMessage");
  const btn = document.getElementById("uploadBtn");

  const formData = new FormData();
  formData.append("file", document.getElementById("fileInput").files[0]);
  formData.append("title", document.getElementById("titleInput").value);
  formData.append("caption", document.getElementById("captionInput").value);
  formData.append("location", document.getElementById("locationInput").value);

  try {
    btn.disabled = true;
    status.innerText = "Uploading to Azure...";

    const response = await fetch(`${API_BASE_URL}/uploadImage`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      status.innerText = "Success! Image uploaded.";
      document.getElementById("uploadForm").reset();
      fetchFeed(); // Refresh the list
    } else {
      status.innerText = "Upload failed.";
    }
  } catch (err) {
    status.innerText = "Error connecting to API.";
  } finally {
    btn.disabled = false;
  }
});

async function fetchFeed() {
  const grid = document.getElementById("imageGrid");
  try {
    const response = await fetch(`${API_BASE_URL}/getFeed`);
    const items = await response.json();

    grid.innerHTML = items
      .map(
        (item) => `
            <div class="card">
                <img src="${item.imageUrl}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p><strong>${item.location}</strong></p>
                <p>${item.caption}</p>
                <small>${new Date(item.createdAt).toLocaleString()}</small>
            </div>
        `
      )
      .join("");
  } catch (err) {
    grid.innerHTML = "<p>Could not load feed.</p>";
  }
}
