// ==========================
// FILE INI DIPAKAI BERSAMA OLEH SEMUA HALAMAN KATEGORI
// (kategoriMakanan, kategoriminuman, kategorisnack, kategoridessert, kategorikopi, kategorijus)
// ==========================

function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

function generateStars(rating) {
    const totalStars = Math.round(rating);
    let stars = "";
    for (let i = 0; i < totalStars; i++) {
        stars += `<i class="fa-solid fa-star"></i>`;
    }
    return stars;
}

// 1. Identifikasi Kategori Aktif
const pageTitle = document.title;
let activeCategory = "";
if (pageTitle.includes("Makanan")) activeCategory = "Makanan";
else if (pageTitle.includes("Minuman")) activeCategory = "Minuman";
else if (pageTitle.includes("Snack")) activeCategory = "Snack";
else if (pageTitle.includes("Dessert")) activeCategory = "Dessert";
else if (pageTitle.includes("Kopi")) activeCategory = "Kopi";
else if (pageTitle.includes("Jus")) activeCategory = "Jus";
else if (pageTitle.includes("Aksesoris")) activeCategory = "Aksesoris";
else if (pageTitle.includes("Alat Tulis")) activeCategory = "Alat Tulis";

let allProducts = [];

// 2. Ambil Container
const container = document.querySelector('.grid.md\\:grid-cols-3.lg\\:grid-cols-4.gap-6');

async function loadCategoryProducts() {
    if (!container) return;
    try {
        const res = await fetch('/api/products/public');
        if (!res.ok) throw new Error("Gagal mengambil data produk");
        
        const products = await res.json();
        // Filter berdasarkan kategori halaman ini
        allProducts = products.filter(p => p.category === activeCategory);
        
        renderProducts(allProducts);
    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400">Gagal memuat produk</div>`;
    }
}

function renderProducts(list) {
    if (list.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400">Tidak ada produk di kategori ini</div>`;
        return;
    }
    
    container.innerHTML = list.map(p => {
        const rating = 4.8; // default rating mockup
        const safeDesc = (p.description || '').replace(/'/g, "\\'");
        const safeBahan = (p.ingredients || '').replace(/'/g, "\\'");
        const isTersedia = p.stock > 0;
        const encodedName = encodeURIComponent(p.name);
        
        return `
<div class="produk-card bg-white rounded-3xl shadow overflow-hidden flex flex-col justify-between" 
     data-rating="${rating}" 
     data-nama="${p.name}" 
     data-harga="${p.price}" 
     data-deskripsi="${safeDesc}" 
     data-bahan="${safeBahan}"
     data-tersedia="${isTersedia}">
    
    <img src="${p.imageUrl || 'https://placehold.co/500x400?text=No+Image'}"
         class="produk-img w-full h-48 object-cover cursor-pointer"
         onclick="bukaModal('${p.name}', ${p.price}, '${p.imageUrl || 'https://placehold.co/500x400?text=No+Image'}', '${safeDesc}', '${safeBahan}')">

    <div class="p-4 flex-1 flex flex-col justify-between">
        <div>
            <h3 class="font-bold">${p.name}</h3>
            
            <div class="flex items-center gap-2 mt-1 mb-2">
                <div class="text-yellow-400 flex gap-1 text-sm">
                    ${generateStars(rating)}
                </div>
                <span class="text-xs text-gray-600">(${rating})</span>
            </div>
            
            <p class="text-blue-700 font-semibold mt-2">
                ${formatRupiah(p.price)}
            </p>
            
            ${!isTersedia ? `
            <p class="text-red-600 font-semibold text-sm mt-1">
                <i class="fa-solid fa-circle-xmark"></i> Stok Tidak Tersedia
            </p>` : ''}
        </div>

        <div class="mt-4">
            <div class="qty-control flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2 ${!isTersedia ? 'opacity-50' : ''}">
                <button type="button" onclick="kurangQty('${encodedName}')" class="btn-minus w-8 h-8 rounded-lg bg-white shadow text-blue-700 font-bold" ${!isTersedia ? 'disabled' : ''}>−</button>
                <span id="qty-${encodedName}" class="qty-value font-semibold">1</span>
                <button type="button" onclick="tambahQty('${encodedName}')" class="btn-plus w-8 h-8 rounded-lg bg-white shadow text-blue-700 font-bold" ${!isTersedia ? 'disabled' : ''}>+</button>
            </div>

            <button onclick="beliRekomendasi('${p.name}', ${p.price}, '${p.imageUrl || 'https://placehold.co/500x400?text=No+Image'}', '${encodedName}')" 
                    class="btn-beli mt-3 w-full py-2 rounded-xl text-white font-semibold transition ${isTersedia ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'}" 
                    ${!isTersedia ? 'disabled' : ''}>
                ${isTersedia ? 'Beli' : 'Stok Habis'}
            </button>
        </div>
    </div>
</div>`;
    }).join('');
}

function kurangQty(id) {
    const el = document.getElementById(`qty-${id}`);
    if (!el) return;
    let val = parseInt(el.textContent, 10);
    if (val > 1) {
        el.textContent = val - 1;
    }
}

function tambahQty(id) {
    const el = document.getElementById(`qty-${id}`);
    if (!el) return;
    let val = parseInt(el.textContent, 10);
    el.textContent = val + 1;
}

function beliRekomendasi(nama, harga, gambar, id) {
    const el = document.getElementById(`qty-${id}`);
    const qty = el ? parseInt(el.textContent, 10) : 1;
    
    // Simpan payload order pembeli
    const payload = {
        items: [{
            product: { name: nama },
            quantity: qty
        }]
    };
    
    // Kirim request ke backend POST /api/orders
    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        if (res.ok) {
            const order = await res.json();
            sessionStorage.setItem("lastOrderId", order.id);
            window.location.href = "/pesanan";
        } else if (res.status === 401 || res.status === 403) {
            window.location.href = "/login";
        } else {
            const err = await res.text();
            alert(err || "Gagal membuat pesanan");
        }
    })
    .catch(e => {
        console.error(e);
        alert("Terjadi kesalahan koneksi");
    });
}

// Modal Handling
const modal = document.getElementById("modalProduk");
const modalImg = document.getElementById("modalImg");
const modalNama = document.getElementById("modalNama");
const modalHarga = document.getElementById("modalHarga");
const modalDeskripsi = document.getElementById("modalDeskripsi");
const modalBahan = document.getElementById("modalBahan");
const btnTutupModal = document.getElementById("btnTutupModal");

function bukaModal(nama, harga, gambar, deskripsi, bahan) {
    if (!modal) return;
    modalImg.src = gambar;
    modalNama.textContent = nama;
    modalHarga.textContent = formatRupiah(harga);
    modalDeskripsi.textContent = deskripsi || '-';
    modalBahan.textContent = bahan || '-';
    modal.classList.remove("hidden");
}

function tutupModal() {
    if (modal) modal.classList.add("hidden");
}

if (btnTutupModal) btnTutupModal.addEventListener("click", tutupModal);
if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) tutupModal();
    });
}
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") tutupModal();
});

// Load awal
loadCategoryProducts();
