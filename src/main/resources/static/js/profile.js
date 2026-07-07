let userRole = "BUYER";

document.addEventListener("DOMContentLoaded", () => {
    fetchProfile();
    
    document.getElementById("btnHome").addEventListener("click", () => {
        if (userRole === "SELLER") {
            window.location.href = "/dashboardPenjual";
        } else {
            window.location.href = "/dashboard";
        }
    });

    document.getElementById("btnLogout").addEventListener("click", () => {
        if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
            window.location.href = "/logout";
        }
    });

    document.getElementById("btnDeleteAccount").addEventListener("click", () => {
        const confirm1 = confirm("PERINGATAN: Apakah Anda yakin ingin menghapus akun Anda?\nSeluruh data pesanan, produk (jika Anda penjual), dan riwayat chat akan dihapus secara permanen dari database.");
        if (confirm1) {
            const confirm2 = confirm("TINDAKAN INI TIDAK DAPAT DIBATALKAN.\nApakah Anda benar-benar yakin ingin menghapus akun?");
            if (confirm2) {
                deleteAccount();
            }
        }
    });
});

async function fetchProfile() {
    try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
            const data = await response.json();
            userRole = data.role;
            
            // Populate UI
            const username = data.username;
            document.getElementById("profileUsername").textContent = username;
            document.getElementById("profileEmail").textContent = data.email;
            
            const roleLabel = userRole === "SELLER" ? "PENJUAL" : "PEMBELI";
            document.getElementById("profileRole").textContent = roleLabel;
            document.getElementById("profileRoleText").textContent = roleLabel;
            
            // Initial
            if (username && username.length > 0) {
                document.getElementById("userInitial").textContent = username.substring(0, 2).toUpperCase();
            }
        } else {
            window.location.href = "/login";
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        showNotification("Gagal memuat profil. Silakan coba lagi.", false, () => {
            window.location.href = "/login";
        });
    }
}

async function deleteAccount() {
    try {
        const response = await fetch("/api/auth/me", {
            method: "DELETE"
        });
        
        if (response.ok) {
            showNotification("Akun Anda berhasil dihapus secara permanen.", true, () => {
                window.location.href = "/registrasi";
            });
        } else {
            const error = await response.json();
            showNotification(error.error || "Gagal menghapus akun. Silakan coba lagi.");
        }
    } catch (error) {
        console.error("Error deleting account:", error);
        showNotification("Terjadi kesalahan sistem saat menghubungi server.");
    }
}

function showNotification(message, isSuccess = false, onClose = null) {
    const toast = document.getElementById("toastNotification");
    const toastMessage = document.getElementById("toastMessage");
    const toastIcon = document.getElementById("toastIcon");
    const toastCloseBtn = document.getElementById("toastCloseBtn");
    
    toastMessage.textContent = message;
    
    if (isSuccess) {
        toastIcon.className = "w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center text-2xl mx-auto mb-4 border border-green-500/20";
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    } else {
        toastIcon.className = "w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-2xl mx-auto mb-4 border border-red-500/20";
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    }
    
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.remove("opacity-0");
    }, 10);
    
    const closeAction = () => {
        toast.classList.add("opacity-0");
        setTimeout(() => {
            toast.classList.add("hidden");
            if (onClose) onClose();
        }, 300);
        
        toastCloseBtn.removeEventListener("click", closeAction);
    };
    
    toastCloseBtn.addEventListener("click", closeAction);
}
