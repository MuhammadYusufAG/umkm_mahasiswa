// ==========================
// AMBIL DATA PESANAN DARI SESSIONSTORAGE
// ==========================

function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

const ringkasanGambar = document.getElementById("ringkasanGambar");
const ringkasanNama = document.getElementById("ringkasanNama");
const ringkasanQty = document.getElementById("ringkasanQty");
const ringkasanTotal = document.getElementById("ringkasanTotal");

// ==========================
// STATUS PESANAN (Terkirim -> Konfirmasi -> Selesai)
// ==========================

const statusIcon = document.getElementById("statusIcon");
const statusJudul = document.getElementById("statusJudul");
const statusKeterangan = document.getElementById("statusKeterangan");

const iconKonfirmasi = document.getElementById("iconKonfirmasi");
const iconSelesai = document.getElementById("iconSelesai");
const lineSatu = document.getElementById("lineSatu");
const lineDua = document.getElementById("lineDua");

const btnKonfirmasiPenjual = document.getElementById("btnKonfirmasiPenjual");
const btnPesananSelesai = document.getElementById("btnPesananSelesai");

function tandaiBaru() {
    statusIcon.innerHTML = `
        <div class="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <i class="fa-solid fa-paper-plane text-2xl text-yellow-600"></i>
        </div>
    `;
    statusJudul.textContent = "Pesanan Terkirim";
    statusKeterangan.textContent = "Mohon tunggu, penjual sedang mengonfirmasi pesananmu...";
    
    iconKonfirmasi.classList.remove("bg-blue-700", "text-white");
    iconKonfirmasi.classList.add("bg-gray-200", "text-gray-400");
    lineSatu.classList.remove("bg-blue-700");
    lineSatu.classList.add("bg-gray-200");
    
    iconSelesai.classList.remove("bg-green-600", "text-white");
    iconSelesai.classList.add("bg-gray-200", "text-gray-400");
    lineDua.classList.remove("bg-green-600");
    lineDua.classList.add("bg-gray-200");

    if (btnKonfirmasiPenjual) btnKonfirmasiPenjual.disabled = false;
    if (btnPesananSelesai) btnPesananSelesai.disabled = true;
}

function tandaiSudahDikonfirmasi() {
    statusIcon.innerHTML = `
        <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <i class="fa-solid fa-check text-2xl text-blue-700"></i>
        </div>
    `;

    statusJudul.textContent = "Pesanan Dikonfirmasi";
    statusKeterangan.textContent = "Penjual sedang menyiapkan pesananmu.";

    iconKonfirmasi.classList.remove("bg-gray-200", "text-gray-400");
    iconKonfirmasi.classList.add("bg-blue-700", "text-white");
    lineSatu.classList.remove("bg-gray-200");
    lineSatu.classList.add("bg-blue-700");

    if (btnKonfirmasiPenjual) {
        btnKonfirmasiPenjual.disabled = true;
        btnKonfirmasiPenjual.classList.add("opacity-50", "cursor-not-allowed");
    }

    if (btnPesananSelesai) {
        btnPesananSelesai.disabled = false;
        btnPesananSelesai.classList.remove("bg-gray-300", "text-gray-500", "cursor-not-allowed");
        btnPesananSelesai.classList.add("bg-green-600", "text-white");
    }
}

function tandaiPesananSelesai() {
    statusIcon.innerHTML = `
        <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <i class="fa-solid fa-bag-shopping text-2xl text-green-600"></i>
        </div>
    `;

    statusJudul.textContent = "Pesanan Selesai";
    statusKeterangan.textContent = "Terima kasih sudah berbelanja di UNIP Market!";

    iconSelesai.classList.remove("bg-gray-200", "text-gray-400");
    iconSelesai.classList.add("bg-green-600", "text-white");
    lineDua.classList.remove("bg-gray-200");
    lineDua.classList.add("bg-green-600");

    if (btnPesananSelesai) {
        btnPesananSelesai.disabled = true;
        btnPesananSelesai.textContent = "Selesai ✓";
        btnPesananSelesai.classList.add("opacity-70", "cursor-not-allowed");
    }
}

if (btnKonfirmasiPenjual) btnKonfirmasiPenjual.addEventListener("click", tandaiSudahDikonfirmasi);
if (btnPesananSelesai) btnPesananSelesai.addEventListener("click", tandaiPesananSelesai);

// Fetch dari Backend API
function fetchMyOrders() {
    fetch('/api/orders/buyer')
        .then(res => {
            if(!res.ok) throw new Error("Unauthorized");
            return res.json();
        })
        .then(orders => {
            if (orders && orders.length > 0) {
                const lastOrder = orders[0];
                
                // Update ringkasan UI
                if (lastOrder.items && lastOrder.items.length > 0) {
                    const item = lastOrder.items[0];
                    ringkasanNama.textContent = item.productName;
                    ringkasanQty.textContent = item.quantity + "x pesanan";
                    
                    const sellerEl = document.getElementById("ringkasanSeller");
                    if (sellerEl) {
                        sellerEl.textContent = lastOrder.sellerName || "-";
                    }

                    const hargaSatuanEl = document.getElementById("ringkasanHargaSatuan");
                    if (hargaSatuanEl) {
                        hargaSatuanEl.textContent = formatRupiah(item.price) + " / pcs";
                    }
                    
                    if (item.productImageUrl) {
                        ringkasanGambar.src = item.productImageUrl;
                    } else if (item.product && item.product.imageUrl) {
                        ringkasanGambar.src = item.product.imageUrl;
                    } else {
                        // fallback image
                        ringkasanGambar.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                    }
                }
                ringkasanTotal.textContent = formatRupiah(lastOrder.totalPrice);
                document.getElementById("ringkasanProduk").classList.remove("hidden");
                
                // Update status UI
                if (lastOrder.status === 'BARU') {
                    tandaiBaru();
                } else if (lastOrder.status === 'DIPROSES') {
                    tandaiSudahDikonfirmasi();
                } else if (lastOrder.status === 'SELESAI') {
                    tandaiSudahDikonfirmasi();
                    tandaiPesananSelesai();
                }
            } else {
                document.getElementById("ringkasanProduk").classList.add("hidden");
            }
        })
        .catch(err => {
            console.error(err);
            // fallback
            const dataPesanan = JSON.parse(sessionStorage.getItem("pesananTerakhir"));
            if(dataPesanan) {
                ringkasanGambar.src = dataPesanan.gambar;
                ringkasanNama.textContent = dataPesanan.nama;
                ringkasanQty.textContent = dataPesanan.qty + "x pesanan";
                ringkasanTotal.textContent = formatRupiah(dataPesanan.harga * dataPesanan.qty);
                document.getElementById("ringkasanProduk").classList.remove("hidden");
            } else {
                document.getElementById("ringkasanProduk").classList.add("hidden");
            }
        });
}

fetchMyOrders();
setInterval(fetchMyOrders, 5000);

// ==========================
// CHAT PENJUAL
// ==========================

const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const btnKirimChat = document.getElementById("btnKirimChat");

function tambahChat(teks, pengirim) {

    const bubble = document.createElement("div");

    if (pengirim === "saya") {
        bubble.className = "flex justify-end";
        bubble.innerHTML = `
            <div class="bg-blue-700 text-white rounded-2xl px-4 py-2 max-w-[75%] text-sm">
                ${teks}
            </div>
        `;
    } else {
        bubble.className = "flex";
        bubble.innerHTML = `
            <div class="bg-gray-100 rounded-2xl px-4 py-2 max-w-[75%] text-sm">
                ${teks}
            </div>
        `;
    }

    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function kirimChat() {

    const teks = chatInput.value.trim();

    if (!teks) {
        return;
    }

    tambahChat(teks, "saya");
    chatInput.value = "";

    // Kirim catatan ke backend
    const lastOrderId = sessionStorage.getItem("lastOrderId");
    if (lastOrderId) {
        fetch(`/api/orders/${lastOrderId}/notes`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: teks })
        }).catch(err => console.error("Gagal mengirim catatan", err));
    }

    // balasan otomatis sederhana dari penjual
    setTimeout(() => {
        tambahChat("Baik, kami catat ya. Terima kasih sudah menghubungi kami 🙏", "penjual");
    }, 800);
}

btnKirimChat.addEventListener("click", kirimChat);

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        kirimChat();
    }
});
