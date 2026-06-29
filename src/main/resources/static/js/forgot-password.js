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

    const form = document.getElementById("forgotPasswordForm");
    const btn = document.getElementById("submitBtn");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("email").value.trim();
            if (!email) {
                showNotification("Email wajib diisi!");
                return;
            }

            // UI Loading state
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            try {
                const response = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email: email })
                });

                if (response.ok) {
                    const data = await response.text();
                    showNotification(data, true);
                    document.getElementById("email").value = "";
                } else {
                    const err = await response.json();
                    showNotification(err.error || "Gagal memproses permintaan");
                }
            } catch (error) {
                showNotification("Terjadi kesalahan sistem.");
            } finally {
                btn.innerHTML = '<span>Kirim Link Reset</span>';
                btn.disabled = false;
            }
        });
    }
});
