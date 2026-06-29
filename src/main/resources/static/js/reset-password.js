function showNotification(message, isSuccess = false) {
    const toast = document.getElementById("toastNotification");
    const toastMessage = document.getElementById("toastMessage");
    const toastTitle = document.getElementById("toastTitle");
    const toastIconContainer = document.getElementById("toastIconContainer");
    const toastIcon = document.getElementById("toastIcon");

    toastMessage.textContent = message;
    
    if (isSuccess) {
        toastTitle.textContent = "Berhasil";
        toastIconContainer.className = "w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-100 text-green-600";
        toastIcon.className = "fa-solid fa-check text-3xl";
    } else {
        toastTitle.textContent = "Gagal";
        toastIconContainer.className = "w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-100 text-red-600";
        toastIcon.className = "fa-solid fa-circle-exclamation text-3xl";
    }

    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.remove("opacity-0");
    }, 10);
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

    // Toggle Password Visibility
    const setupToggle = (btnId, inputId, iconId) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (btn && input && icon) {
            btn.addEventListener("click", () => {
                if (input.type === "password") {
                    input.type = "text";
                    icon.classList.replace("fa-eye", "fa-eye-slash");
                } else {
                    input.type = "password";
                    icon.classList.replace("fa-eye-slash", "fa-eye");
                }
            });
        }
    };
    setupToggle("toggleP1", "newPassword", "eye1");
    setupToggle("toggleP2", "confirmPassword", "eye2");

    const form = document.getElementById("resetPasswordForm");
    const btn = document.getElementById("submitBtn");
    const passwordError = document.getElementById("passwordError");

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        showNotification("Token reset password tidak ditemukan di URL!");
        if (btn) btn.disabled = true;
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const newPassword = document.getElementById("newPassword").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();
            
            if (newPassword !== confirmPassword) {
                passwordError.classList.remove("hidden");
                return;
            } else {
                passwordError.classList.add("hidden");
            }

            if (newPassword.length < 6) {
                showNotification("Password minimal 6 karakter!");
                return;
            }

            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            try {
                const response = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token: token, newPassword: newPassword })
                });

                if (response.ok) {
                    const data = await response.text();
                    showNotification(data, true);
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 2000);
                } else {
                    const err = await response.json();
                    showNotification(err.error || "Gagal mereset password");
                }
            } catch (error) {
                showNotification("Terjadi kesalahan sistem.");
            } finally {
                btn.innerHTML = '<span>Simpan Password Baru</span>';
                btn.disabled = false;
            }
        });
    }
});
