// ==========================
// AMBIL DATA PESANAN DARI SESSIONSTORAGE
// ==========================

function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

const dataPesanan = JSON.parse(sessionStorage.getItem("pesananTerakhir"));

const ringkasanGambar = document.getElementById("ringkasanGambar");
const ringkasanNama = document.getElementById("ringkasanNama");
const ringkasanQty = document.getElementById("ringkasanQty");
const ringkasanTotal = document.getElementById("ringkasanTotal");

if (dataPesanan) {
    ringkasanGambar.src = dataPesanan.gambar;
    ringkasanNama.textContent = dataPesanan.nama;
    ringkasanQty.textContent = dataPesanan.qty + "x pesanan";
    ringkasanTotal.textContent = formatRupiah(dataPesanan.harga * dataPesanan.qty);
} else {
    document.getElementById("ringkasanProduk").classList.add("hidden");
}

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

    btnKonfirmasiPenjual.disabled = true;
    btnKonfirmasiPenjual.classList.add("opacity-50", "cursor-not-allowed");

    btnPesananSelesai.disabled = false;
    btnPesananSelesai.classList.remove("bg-gray-300", "text-gray-500", "cursor-not-allowed");
    btnPesananSelesai.classList.add("bg-green-600", "text-white");

    tambahChat("Pesananmu sudah kami konfirmasi dan sedang disiapkan ya, mohon ditunggu 😊", "penjual");
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

    btnPesananSelesai.disabled = true;
    btnPesananSelesai.textContent = "Selesai ✓";
    btnPesananSelesai.classList.add("opacity-70", "cursor-not-allowed");

    tambahChat("Pesanan sudah selesai, semoga puas dan ditunggu pesanan berikutnya ya! 🙏", "penjual");
}

btnKonfirmasiPenjual.addEventListener("click", tandaiSudahDikonfirmasi);
btnPesananSelesai.addEventListener("click", tandaiPesananSelesai);

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
