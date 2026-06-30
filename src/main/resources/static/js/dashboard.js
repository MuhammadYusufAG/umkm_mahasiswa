// ==========================
// DATA PRODUK
// ==========================

const products = [
    {
        name: "Nasi Ayam Geprek",
        price: "20.000",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500",
        description: "Nasi hangat dengan ayam geprek pedas gurih ala mahasiswa.",
        bahan: "Beras, ayam, sambal geprek"
    },
    {
        name: "Mie Goreng Special",
        price: "18.000",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500",
        description: "Indomie goreng dengan telur ceplok dan sosis.",
        bahan: "Mie, telur, sosis, bumbu rahasia"
    },
    {
        name: "Es Kopi Susu",
        price: "16.000",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500",
        description: "Kopi susu gula aren segar untuk menemani nugas.",
        bahan: "Kopi espresso, susu segar, gula aren"
    },
    {
        name: "Thai Tea",
        price: "15.000",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500",
        description: "Teh Thailand otentik dengan susu kental manis.",
        bahan: "Daun teh Thailand, susu"
    },
    {
        name: "Cheese Burger",
        price: "22.000",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
        description: "Burger dengan patty daging sapi asli dan keju meleleh.",
        bahan: "Roti burger, beef patty, keju slice, sayuran"
    }
];

// ==========================
// GENERATE STAR RATING
// ==========================

function generateStars(rating) {
    const totalStars = Math.round(rating);
    let stars = "";

    for (let i = 0; i < totalStars; i++) {
        stars += `<i class="fa-solid fa-star"></i>`;
    }

    return stars;
}

// ==========================
// RENDER PRODUK
// ==========================

const container = document.getElementById("productContainer");

if (container) {
    products.forEach(product => {
        const safeDesc = product.description.replace(/'/g, "\\'");
        const safeBahan = product.bahan.replace(/'/g, "\\'");
        const encodedName = encodeURIComponent(product.name);
        
        container.innerHTML += `
            <div class="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition flex flex-col">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="w-full h-44 object-cover cursor-pointer"
                    onclick="bukaModalDeskripsi('${product.name}', '${product.price}', '${product.image}', '${safeDesc}', '${safeBahan}')">

                <div class="p-4 flex-1 flex flex-col">

                    <h4 class="font-semibold text-gray-800">
                        ${product.name}
                    </h4>

                    <div class="flex items-center gap-2 mt-2">
                        <div class="text-yellow-400 flex gap-1">
                            ${generateStars(product.rating)}
                        </div>

                        <span class="text-sm text-gray-600">
                            (${product.rating})
                        </span>
                    </div>

                    <div class="font-bold text-blue-700 mt-3 mb-2">
                        Rp ${product.price}
                    </div>
                    
                    <div class="mt-auto">
                        <div class="qty-control flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2 mb-2">
                            <button type="button" onclick="kurangQty('${encodedName}')" class="btn-minus w-8 h-8 rounded-lg bg-white shadow text-blue-700 font-bold">−</button>
                            <span id="qty-${encodedName}" class="qty-value font-semibold">1</span>
                            <button type="button" onclick="tambahQty('${encodedName}')" class="btn-plus w-8 h-8 rounded-lg bg-white shadow text-blue-700 font-bold">+</button>
                        </div>
                        <button onclick="beliRekomendasi('${product.name}', '${product.price}', '${product.image}', '${encodedName}')" class="w-full bg-blue-700 text-white py-2 rounded-xl hover:bg-blue-800 transition">
                            Beli
                        </button>
                    </div>

                </div>

            </div>
        `;
    });
}

function kurangQty(id) {
    const el = document.getElementById(`qty-${id}`);
    let val = parseInt(el.textContent, 10);
    if (val > 1) {
        el.textContent = val - 1;
    }
}

function tambahQty(id) {
    const el = document.getElementById(`qty-${id}`);
    let val = parseInt(el.textContent, 10);
    el.textContent = val + 1;
}

function beliRekomendasi(nama, hargaStr, gambar, id) {
    const hargaInt = parseInt(hargaStr.replace(/\./g, ""), 10);
    const el = document.getElementById(`qty-${id}`);
    const qty = el ? parseInt(el.textContent, 10) : 1;
    
    const pesanan = {
        nama: nama,
        harga: hargaInt,
        qty: qty,
        gambar: gambar
    };
    sessionStorage.setItem("pesananTerakhir", JSON.stringify(pesanan));
    window.location.href = "/pesanan";
}

// ==========================
// MODAL DESKRIPSI PRODUK
// ==========================

const modal = document.getElementById("modalProduk");
const btnTutupModal = document.getElementById("btnTutupModal");

if (modal) {
    function tutupModal() {
        modal.classList.add("hidden");
    }

    if (btnTutupModal) {
        btnTutupModal.addEventListener("click", tutupModal);
    }

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
}

function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

function bukaModalDeskripsi(nama, hargaStr, gambar, deskripsi, bahan) {
    if (!modal) return;
    
    document.getElementById("modalImg").src = gambar;
    document.getElementById("modalNama").textContent = nama;
    document.getElementById("modalHarga").textContent = "Rp " + hargaStr;
    document.getElementById("modalDeskripsi").textContent = deskripsi;
    document.getElementById("modalBahan").textContent = bahan;
    
    modal.classList.remove("hidden");
}

// ==========================
// BANNER CAROUSEL
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