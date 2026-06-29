function togglePassword() {
    const password = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");

    password.type =
        password.type === "password" ? "text" : "password";

    eyeIcon.classList.toggle("fa-eye");
    eyeIcon.classList.toggle("fa-eye-slash");
}

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("togglePasswordBtn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", togglePassword);
    }
});

document.querySelector("form").addEventListener("submit", function (e) {

    const username =
        document.querySelector('input[type="text"]').value.trim();

    const password =
        document.getElementById("password").value.trim();

    if (!username || !password) {
        e.preventDefault();

        alert("Email/Username dan Password wajib diisi!");
        return;
    }

    window.location.href = "dashboard.html";
});
