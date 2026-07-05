// ==========================
// RENDER PRODUK DINAMIS DARI BACKEND
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

const container = document.getElementById("productContainer");
let productList = [];

async function fetchPublicProducts() {
    if (!container) return;
    try {
        const res = await fetch('/api/products/public');
        if (!res.ok) throw new Error("Gagal mengambil data produk");
        productList = await res.json();
        renderProducts(productList);
    } catch (e) {
        console.error(e);
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400">Gagal memuat produk</div>`;
    }
}

function renderProducts(products) {
    container.innerHTML = "";
    if (products.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400">Tidak ada produk ditemukan</div>`;
        return;
    }
    
    products.forEach(product => {
        const rating = 4.8; // default rating mockup
        const safeDesc = (product.description || "").replace(/'/g, "\\'");
        const safeBahan = (product.ingredients || "").replace(/'/g, "\\'");
        const isTersedia = product.stock > 0;

        container.innerHTML += `
            <div class="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition flex flex-col justify-between">
                <img
                    src="${product.imageUrl || 'https://placehold.co/500x400?text=No+Image'}"
                    alt="${product.name}"
                    class="w-full h-44 object-cover cursor-pointer"
                    onclick="bukaModalDeskripsi('${product.name}', ${product.price}, '${product.imageUrl || 'https://placehold.co/500x400?text=No+Image'}', '${safeDesc}', '${safeBahan}')">

                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <h4 class="font-semibold text-gray-800">${product.name}</h4>

                        <div class="flex items-center gap-2 mt-2">
                            <div class="text-yellow-400 flex gap-1">
                                ${generateStars(rating)}
                            </div>
                            <span class="text-sm text-gray-600">(${rating})</span>
                        </div>

                        <div class="font-bold text-blue-700 mt-3 mb-2">
                            ${formatRupiah(product.price)}
                        </div>
                        
                        ${!isTersedia ? `
                        <p class="text-red-600 font-semibold text-sm mt-1 mb-2">
                            <i class="fa-solid fa-circle-xmark"></i> Stok Tidak Tersedia
                        </p>` : ''}
                    </div>
                    
                    <div>
                        <div class="qty-control flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2 mb-2 ${!isTersedia ? 'opacity-50' : ''}">
                            <button type="button" onclick="kurangQty(${product.id})" class="btn-minus w-8 h-8 rounded-lg bg-white shadow text-blue-700 font-bold" ${!isTersedia ? 'disabled' : ''}>−</button>
                            <span id="qty-${product.id}" class="qty-value font-semibold">1</span>
                            <button type="button" onclick="tambahQty(${product.id})" class="btn-plus w-8 h-8 rounded-lg bg-white shadow text-blue-700 font-bold" ${!isTersedia ? 'disabled' : ''}>+</button>
                        </div>
                        <button onclick="beliRekomendasi('${product.name}', ${product.price}, '${product.imageUrl || 'https://placehold.co/500x400?text=No+Image'}', ${product.id})" 
                                class="w-full py-2 rounded-xl text-white font-semibold transition ${isTersedia ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'}"
                                ${!isTersedia ? 'disabled' : ''}>
                            ${isTersedia ? 'Beli' : 'Stok Habis'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
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
    
    // Kirim request buat pesanan ke backend POST /api/orders
    const payload = {
        items: [{
            productId: id,
            quantity: qty
        }]
    };
    
    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        if (res.redirected && res.url.includes('/login')) {
            window.location.href = "/login";
            return;
        }
        if (res.ok) {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const order = await res.json();
                sessionStorage.setItem("lastOrderId", order.id);
                window.location.href = "/pesanan";
            } else {
                // If it's not JSON, might be a redirect or error page
                window.location.href = "/login";
            }
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

// Modal Deskripsi Produk
const modal = document.getElementById("modalProduk");
const btnTutupModal = document.getElementById("btnTutupModal");

function bukaModalDeskripsi(nama, harga, gambar, deskripsi, bahan) {
    if (!modal) return;
    document.getElementById("modalImg").src = gambar;
    document.getElementById("modalNama").textContent = nama;
    document.getElementById("modalHarga").textContent = formatRupiah(harga);
    document.getElementById("modalDeskripsi").textContent = deskripsi || '-';
    document.getElementById("modalBahan").textContent = bahan || '-';
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

// Load awal untuk data produk
fetchPublicProducts();

// ==========================
// BANNER CAROUSEL & ROLE CHECK
// ==========================

document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".banner-slide");
    const dots = document.querySelectorAll(".dot");

    if (slides.length === 0) return;

    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => {
            slide.classList.remove("opacity-100");
            slide.classList.add("opacity-0");
        });

        dots.forEach(dot => {
            dot.classList.remove("bg-white");
            dot.classList.add("bg-white/50");
        });

        slides[index].classList.remove("opacity-0");
        slides[index].classList.add("opacity-100");

        if (dots[index]) {
            dots[index].classList.remove("bg-white/50");
            dots[index].classList.add("bg-white");
        }
    }

    showSlide(0);

    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 3000);
});

// Category Card Navigation
document.addEventListener("DOMContentLoaded", () => {
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach(card => {
        card.addEventListener("click", () => {
            const href = card.getAttribute("data-href");
            if (href) {
                window.location.href = href;
            }
        });
    });
});

// Check User Role for Data UMKM Navbar Link
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const user = await res.json();
            const navbarDataUmkm = document.getElementById('navbarDataUmkm');
            if (navbarDataUmkm && user.role === 'SELLER') {
                navbarDataUmkm.classList.remove('hidden');
                navbarDataUmkm.setAttribute('href', '/dashboardPenjual');
            }
        }
    } catch (e) {
        console.error("Gagal memeriksa role pengguna:", e);
    }
});