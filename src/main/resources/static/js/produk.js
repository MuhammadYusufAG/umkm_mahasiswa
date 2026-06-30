// ==========================
// FILE INI DIPAKAI BERSAMA OLEH SEMUA HALAMAN KATEGORI
// (kategoriMakanan, kategoriminuman, kategorisnack, kategoridessert, kategorikopi, kategorijus)
// Berisi: kontrol qty (+/-), tombol Beli -> ke halaman pesanan, dan modal deskripsi produk.
// ==========================

function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}
// ==========================
// CEK STATUS STOK
// ==========================

document.querySelectorAll(".produk-card").forEach(card => {

    if (card.dataset.tersedia === "false") {

        const qtyControl = card.querySelector(".qty-control");
        const btnBeli = card.querySelector(".btn-beli");

        if (qtyControl) {
            qtyControl.classList.add("opacity-50");
        }

        if (btnBeli) {
            btnBeli.disabled = true;
            btnBeli.textContent = "Stok Habis";
            btnBeli.classList.remove("bg-blue-700");
            btnBeli.classList.add("bg-gray-400", "cursor-not-allowed");
        }
    }

});
// ==========================
// FILTER PRODUK
// ==========================

const filterButtons = document.querySelectorAll(".filter-btn");
const produkCards = document.querySelectorAll(".produk-card");

if (filterButtons.length > 0) {

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter = button.dataset.filter;

            // reset tombol
            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "bg-blue-700",
                    "text-white"
                );

                btn.classList.add(
                    "bg-white",
                    "text-blue-700",
                    "border",
                    "border-blue-700"
                );

            });

            // tombol aktif
            button.classList.remove(
                "bg-white",
                "text-blue-700",
                "border",
                "border-blue-700"
            );

            button.classList.add(
                "bg-blue-700",
                "text-white"
            );

            // filter produk
            produkCards.forEach(card => {

                const kategori = card.dataset.kategori;

                if (
                    filter === "all" ||
                    kategori === filter
                ) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }

            });

        });

    });

}
// ==========================
// QTY CONTROL (+ / -)
// ==========================

document.querySelectorAll(".produk-card").forEach(card => {

    const qtyValue = card.querySelector(".qty-value");
    const btnMinus = card.querySelector(".btn-minus");
    const btnPlus = card.querySelector(".btn-plus");

    btnPlus.addEventListener("click", () => {

        if (card.dataset.tersedia === "false") {
            return;
        }

        let qty = parseInt(qtyValue.textContent, 10);
        qty++;
        qtyValue.textContent = qty;
    });

    btnMinus.addEventListener("click", () => {

        if (card.dataset.tersedia === "false") {
            return;
        }

        let qty = parseInt(qtyValue.textContent, 10);
        if (qty > 0) {
            qty--;
        }
        qtyValue.textContent = qty;
    });

});

// ==========================
// TOMBOL BELI -> SIMPAN PESANAN & PINDAH KE HALAMAN PESANAN
// ==========================

document.querySelectorAll(".btn-beli").forEach(btn => {

    btn.addEventListener("click", () => {

        const card = btn.closest(".produk-card");

        if (card.dataset.tersedia === "false") {
            alert(card.dataset.nama + " sedang habis stoknya. Silakan pilih produk lain.");
            return;
        }

        const qtyValue = card.querySelector(".qty-value");
        let qty = parseInt(qtyValue.textContent, 10);

        if (qty < 1) {
            qty = 1;
            qtyValue.textContent = qty;
        }

        const pesanan = {
            nama: card.dataset.nama,
            harga: parseInt(card.dataset.harga, 10),
            qty: qty,
            gambar: card.querySelector(".produk-img").src
        };

        sessionStorage.setItem("pesananTerakhir", JSON.stringify(pesanan));

        window.location.href = "/pesanan";

    });

});

// ==========================
// MODAL DESKRIPSI PRODUK (klik foto)
// ==========================

const modal = document.getElementById("modalProduk");
const modalImg = document.getElementById("modalImg");
const modalNama = document.getElementById("modalNama");
const modalHarga = document.getElementById("modalHarga");
const modalDeskripsi = document.getElementById("modalDeskripsi");
const modalBahan = document.getElementById("modalBahan");
const btnTutupModal = document.getElementById("btnTutupModal");

document.querySelectorAll(".produk-img").forEach(img => {

    img.addEventListener("click", () => {

        const card = img.closest(".produk-card");

        modalImg.src = img.src;
        modalNama.textContent = card.dataset.nama;
        modalHarga.textContent = formatRupiah(card.dataset.harga);
        modalDeskripsi.textContent = card.dataset.deskripsi;
        modalBahan.textContent = card.dataset.bahan;

        modal.classList.remove("hidden");

    });

});

function tutupModal() {
    modal.classList.add("hidden");
}

btnTutupModal.addEventListener("click", tutupModal);

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        tutupModal();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        tutupModal();
    }
});
// ==========================
// RENDER RATING BINTANG
// ==========================
document.querySelectorAll(".produk-card").forEach(card => {
    const ratingValue = card.dataset.rating;
    if (ratingValue) {
        const ratingNum = parseFloat(ratingValue);
        const totalStars = Math.round(ratingNum);
        let starsHtml = "";
        for (let i = 0; i < totalStars; i++) {
            starsHtml += `<i class="fa-solid fa-star"></i>`;
        }
        
        // Find the title element to insert the rating below it
        const titleEl = card.querySelector("h3.font-bold");
        if (titleEl) {
            const ratingContainer = document.createElement("div");
            ratingContainer.className = "flex items-center gap-2 mt-1 mb-2";
            ratingContainer.innerHTML = `
                <div class="text-yellow-400 flex gap-1 text-sm">
                    ${starsHtml}
                </div>
                <span class="text-xs text-gray-600">(${ratingValue})</span>
            `;
            titleEl.parentNode.insertBefore(ratingContainer, titleEl.nextSibling);
        }
    }
});
