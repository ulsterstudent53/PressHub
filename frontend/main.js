// Check if user is logged in
document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("user");
  if (!userData) {
    window.location.href = "login.html"; // Redirect if not logged in
    return;
  }

  const user = JSON.parse(userData);
  console.log("Logged in as:", user.name, "Role:", user.role);

  // UI Update: Hide upload section if NOT a creator
  const uploadSection = document.getElementById("uploadSection");
  if (user.role !== "creator" && uploadSection) {
    uploadSection.classList.add("hidden");
  }
});

function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}
