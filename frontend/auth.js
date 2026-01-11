// Change this to your actual Azure Function App URL!
const API_BASE_URL = "https://your-function-app-name.azurewebsites.net/api";

// --- SIGNUP LOGIC ---
async function handleSignup(event) {
  event.preventDefault(); // Stop page refresh

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      alert("Account created! Please log in.");
      window.location.href = "login.html";
    } else {
      const err = await response.text();
      alert("Signup failed: " + err);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// --- LOGIN LOGIC ---
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value; // Ensure your HTML IDs match!
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const user = await response.json();
      // Store user info in local storage so the site "remembers" them
      localStorage.setItem("user", JSON.stringify(user));

      alert(`Welcome back, ${user.name}!`);
      window.location.href = "index.html";
    } else {
      alert("Invalid email or password");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
