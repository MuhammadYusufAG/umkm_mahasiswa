// ==========================
// RENDER PRODUK DINAMIS DARI BACKEND
// ==========================

if (!window.showToast) {
    const script = document.createElement('script');
    script.src = '/js/toast.js';
    script.async = false;
    document.head.appendChild(script);
}

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
                        <button onclick="tambahKeKeranjangRekomendasi(${product.id})" 
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

// ==========================
// KODE KERANJANG BELANJA (CART SYSTEM)
// ==========================

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function tambahKeKeranjang(id, sourceList) {
    const product = sourceList.find(p => p.id === id);
    if (!product) return;

    let cart = getCart();

    const qtyEl = document.getElementById(`qty-${id}`);
    const qty = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;

    const existingIndex = cart.findIndex(item => item.id === id);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: qty,
            seller: product.seller
        });
    }

    saveCart(cart);
    showToast(`${product.name} berhasil ditambahkan ke keranjang!`, 'success');
    
    // Reset qty selector ke 1
    if (qtyEl) qtyEl.textContent = "1";
}

function tambahKeKeranjangRekomendasi(id) {
    tambahKeKeranjang(id, productList);
}

// ==========================
// MODAL KERANJANG CONTROLLER
// ==========================

const modalKeranjang = document.getElementById("modalKeranjang");
const btnKeranjang = document.getElementById("btnKeranjang");
const btnTutupKeranjang = document.getElementById("btnTutupKeranjang");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotal = document.getElementById("cartTotal");
const cartNotes = document.getElementById("cartNotes");
const btnCheckout = document.getElementById("btnCheckout");

function formatRupiahCart(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

function renderCartItems() {
    if (!cartItemsContainer) return;
    
    const cart = getCart();
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<div class="text-center py-10 text-gray-400">Keranjang belanja kosong</div>`;
        cartTotal.textContent = "Rp 0";
        if (btnCheckout) btnCheckout.disabled = true;
        return;
    }

    if (btnCheckout) btnCheckout.disabled = false;
    
    // Group by seller
    const groups = {};
    cart.forEach(item => {
        const sId = item.seller.id;
        if (!groups[sId]) {
            groups[sId] = {
                sellerName: item.seller.username,
                items: [],
                subtotal: 0
            };
        }
        groups[sId].items.push(item);
        groups[sId].subtotal += item.price * item.quantity;
    });

    let grandTotal = 0;
    let html = '';

    for (const sId in groups) {
        const group = groups[sId];
        grandTotal += group.subtotal;
        
        html += `
            <div class="border border-gray-150 rounded-2xl p-4 bg-white shadow-sm space-y-3 mb-4">
                <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <i class="fa-solid fa-store text-blue-700 text-sm"></i>
                    <span class="font-bold text-gray-800 text-sm">${group.sellerName}</span>
                </div>
                <div class="space-y-3">
                    ${group.items.map(item => `
                        <div class="flex items-start gap-3">
                            <img src="${item.imageUrl || 'https://placehold.co/500x400?text=No+Image'}" alt="${item.name}" class="w-12 h-12 object-cover rounded-xl mt-1">
                            <div class="flex-1">
                                <h5 class="font-semibold text-sm text-gray-800">${item.name}</h5>
                                <p class="text-xs text-blue-700 font-semibold mt-0.5">${formatRupiahCart(item.price)}</p>
                                <input type="text" placeholder="Catatan untuk item ini..." value="${item.notes || ''}" 
                                       onchange="updateCatatanItem(${item.id}, this.value)"
                                       class="w-full mt-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-600">
                            </div>
                            <div class="flex items-center gap-1.5 mt-1">
                                <button onclick="ubahQtyKeranjang(${item.id}, -1)" class="w-6 h-6 rounded-lg bg-gray-100 text-blue-700 font-bold text-xs flex items-center justify-center">−</button>
                                <span class="text-xs font-semibold w-4 text-center">${item.quantity}</span>
                                <button onclick="ubahQtyKeranjang(${item.id}, 1)" class="w-6 h-6 rounded-lg bg-gray-100 text-blue-700 font-bold text-xs flex items-center justify-center">+</button>
                            </div>
                            <div class="text-right min-w-[70px] mt-1">
                                <span class="font-bold text-gray-800 text-xs">${formatRupiahCart(item.price * item.quantity)}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-100 text-xs font-bold text-gray-600">
                    <span>Subtotal Toko</span>
                    <span class="text-blue-700">${formatRupiahCart(group.subtotal)}</span>
                </div>
            </div>
        `;
    }

    cartItemsContainer.innerHTML = html;
    cartTotal.textContent = formatRupiahCart(grandTotal);
}

function updateCatatanItem(id, notes) {
    let cart = getCart();
    const idx = cart.findIndex(item => item.id === id);
    if (idx !== -1) {
        cart[idx].notes = notes;
        saveCart(cart);
    }
}

function ubahQtyKeranjang(id, diff) {
    let cart = getCart();
    const idx = cart.findIndex(item => item.id === id);
    if (idx === -1) return;

    cart[idx].quantity += diff;
    if (cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
    }
    
    saveCart(cart);
    renderCartItems();
}

function bukaKeranjang() {
    if (modalKeranjang) {
        renderCartItems();
        modalKeranjang.classList.remove("hidden");
    }
}

function tutupKeranjang() {
    if (modalKeranjang) {
        modalKeranjang.classList.add("hidden");
    }
}

if (btnKeranjang) btnKeranjang.addEventListener("click", bukaKeranjang);
if (btnTutupKeranjang) btnTutupKeranjang.addEventListener("click", tutupKeranjang);
if (modalKeranjang) {
    modalKeranjang.addEventListener("click", (e) => {
        if (e.target === modalKeranjang) tutupKeranjang();
    });
}

// Checkout handler
if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
        const cart = getCart();
        if (cart.length === 0) return;

        btnCheckout.disabled = true;
        btnCheckout.textContent = "Memproses...";

        // Group by seller
        const groups = {};
        let hasInvalidItems = false;
        
        cart.forEach(item => {
            const sId = (item.seller && item.seller.id) ? item.seller.id : 'unknown';
            if (sId === 'unknown') {
                hasInvalidItems = true;
            }
            if (!groups[sId]) {
                groups[sId] = [];
            }
            groups[sId].push(item);
        });
        
        if (hasInvalidItems) {
            showToast("Keranjang belanja Anda mengandung produk dari versi aplikasi sebelumnya. Mohon kosongkan keranjang dan masukkan kembali produk Anda agar bisa memproses checkout.", "error");
            btnCheckout.disabled = false;
            btnCheckout.textContent = "Pesan Sekarang (Checkout)";
            return;
        }

        // Buat checkout request asinkron per seller
        const checkoutPromises = Object.keys(groups).map(sId => {
            const items = groups[sId];
            const payload = {
                notes: "",
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    notes: item.notes || ""
                }))
            };

            return fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(async res => {
                if (!res.ok) {
                    const errMsg = await res.text();
                    throw new Error(errMsg || "Gagal membuat salah satu pesanan");
                }
                return res.json();
            });
        });

        Promise.all(checkoutPromises)
        .then(orders => {
            // Kosongkan keranjang belanja
            localStorage.removeItem('cart');
            updateCartBadge();
            
            if (orders.length > 0) {
                sessionStorage.setItem("lastOrderId", orders[0].id);
            }
            window.location.href = "/pesanan";
        })
        .catch(e => {
            console.error(e);
            showToast(e.message || "Gagal membuat beberapa pesanan. Silakan periksa koneksi atau stok barang.", "error");
            btnCheckout.disabled = false;
            btnCheckout.textContent = "Pesan Sekarang (Checkout)";
        });
    });
}

// Inisialisasi awal badge keranjang
document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
});

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