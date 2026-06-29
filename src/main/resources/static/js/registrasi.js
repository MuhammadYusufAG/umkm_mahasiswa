document.addEventListener("DOMContentLoaded", () => {
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
                alert("Semua field wajib diisi!");
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
                alert("Password minimal 6 karakter!");
                return;
            }

            if (!valid) return;

            // Simulasi registrasi berhasil -> redirect sesuai role
            alert("Registrasi berhasil! Selamat datang, " + nama + "!");
            if (selectedRole === "penjual") {
                window.location.href = "dashboard-penjual.html";
            } else {
                window.location.href = "dashboard.html";
            }
        });
    }
});
