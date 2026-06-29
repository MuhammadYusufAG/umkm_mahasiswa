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

    let selectedRole = null;

    // ==========================================
    // ROLE SELECTION CARD EVENTS
    // ==========================================
    const roleInputs = document.querySelectorAll('input[name="role"]');
    const labelPembeli = document.getElementById("labelPembeli");
    const labelPenjual = document.getElementById("labelPenjual");
    const roleError = document.getElementById("roleError");

    roleInputs.forEach(input => {
        input.addEventListener("change", (e) => {
            selectedRole = e.target.value;
            roleError.classList.add("hidden");

            // Reset borders and backgrounds
            labelPembeli.classList.remove("border-blue-500", "bg-blue-50/40");
            labelPenjual.classList.remove("border-blue-500", "bg-blue-50/40");
            labelPembeli.classList.add("border-gray-200");
            labelPenjual.classList.add("border-gray-200");

            if (selectedRole === "pembeli") {
                labelPembeli.classList.remove("border-gray-200");
                labelPembeli.classList.add("border-blue-500", "bg-blue-50/40");
            } else if (selectedRole === "penjual") {
                labelPenjual.classList.remove("border-gray-200");
                labelPenjual.classList.add("border-blue-500", "bg-blue-50/40");
            }
        });
    });

    // ==========================================
    // TOGGLE PASSWORD VISIBILITY
    // ==========================================
    const setupPasswordToggle = (btnId, inputId, iconId) => {
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

    setupPasswordToggle("togglePasswordBtn1", "password", "eyeIcon1");
    setupPasswordToggle("togglePasswordBtn2", "confirmPassword", "eyeIcon2");

    // ==========================================
    // SUBMIT FORM EVENT
    // ==========================================
    const form = document.getElementById("registerForm");
    const passwordError = document.getElementById("passwordError");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let valid = true;

            const nama = document.getElementById("nama").value.trim();
            const alamat = document.getElementById("alamat").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            if (!nama || !alamat || !email || !password || !confirmPassword) {
                showNotification("Semua field wajib diisi!");
                return;
            }

            if (!selectedRole) {
                roleError.classList.remove("hidden");
                valid = false;
            }

            if (password !== confirmPassword) {
                passwordError.classList.remove("hidden");
                valid = false;
            } else {
                passwordError.classList.add("hidden");
            }

            if (password.length < 6) {
                showNotification("Password minimal 6 karakter!");
                return;
            }

            if (!valid) return;

            // Melakukan request registrasi ke API backend
            const payload = {
                username: nama,
                email: email,
                password: password,
                role: selectedRole.toUpperCase()
            };

            fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(async (response) => {
                if (response.ok) {
                    showNotification("Registrasi berhasil! Silakan login.", true);
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 2000);
                } else {
                    const errMsg = await response.text();
                    showNotification("Gagal registrasi: " + errMsg);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification("Terjadi kesalahan sistem saat menghubungi server.");
            });
        });
    }
});
