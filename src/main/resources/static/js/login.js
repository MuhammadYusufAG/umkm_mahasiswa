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

document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.querySelector('input[type="text"]').value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        showNotification("Email/Username dan Password wajib diisi!");
        return;
    }

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.role === "SELLER") {
                window.location.href = "/dashboardPenjual";
            } else {
                window.location.href = "/dashboard";
            }
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || "Username atau Password salah!");
        }
    } catch (error) {
        showNotification("Terjadi kesalahan sistem. Silakan coba lagi.");
    }
});

function showNotification(message) {
    const toast = document.getElementById("toastNotification");
    const toastMessage = document.getElementById("toastMessage");
    
    toastMessage.textContent = message;
    
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.remove("opacity-0");
    }, 10);

    setTimeout(() => {
        closeNotification();
    }, 3000);
}

function closeNotification() {
    const toast = document.getElementById("toastNotification");
    toast.classList.add("opacity-0");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("closeToastBtn");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeNotification);
    }
});
