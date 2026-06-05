# Issue: Integrasi Halaman Dashboard UNIP Market ke Spring Boot (Pemisahan HTML, CSS, dan JS)

## Deskripsi
Integrasikan desain halaman dashboard UNIP Market ke dalam proyek Spring Boot. Sesuai dengan instruksi, pastikan seluruh kode HTML, CSS, dan JavaScript dipisahkan secara bersih ke dalam file masing-masing menggunakan struktur direktori Spring Boot.

## Rencana Implementasi

### 1. Pemisahan Kode & Aset Statis
* **HTML:** Buat file template baru di `/src/main/resources/templates/dashboard.html` menggunakan Thymeleaf. Gunakan tag Thymeleaf untuk memanggil file CSS (`th:href="@{/css/dashboard.css}"`) dan file JS (`th:src="@{/js/dashboard.js}"`).
* **CSS:** Pindahkan seluruh stylesheet ke file eksternal baru di `/src/main/resources/static/css/dashboard.css`.
* **JS:** Pindahkan logika data produk dan render DOM dari `<script>` ke file eksternal baru di `/src/main/resources/static/js/dashboard.js`.

### 2. Pembuatan Controller
* Buat controller Spring Boot (misalnya `DashboardController.java`) untuk menangani routing GET ke `/dashboard` dan mengembalikan view name `"dashboard"`.

### 3. Konfigurasi Keamanan (Security Config)
* Pastikan file CSS dan JS baru (`/css/dashboard.css` dan `/js/dashboard.js`) diizinkan untuk diakses di `SecurityConfig.java` agar tampilan tidak rusak saat dimuat.

---

## Lampiran: Kode Sumber Terpisah

### 1. dashboard.html
*(Thymeleaf-ready template, script inline dan style sudah dipisahkan)*
```html
<!DOCTYPE html>
<html lang="id" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIP Market Dashboard</title>

    <!-- Tailwind & FontAwesome CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">

    <!-- Custom CSS (Thymeleaf) -->
    <link rel="stylesheet" th:href="@{/css/dashboard.css}">
</head>
<body class="bg-gray-100">

    <!-- HEADER -->
    <header class="bg-white shadow-sm">
        <div class="container mx-auto px-6 py-4 flex items-center justify-between">

            <!-- Logo -->
            <div class="flex items-center gap-3">
                <div class="text-blue-700 text-4xl">
                    <i class="fa-solid fa-cart-shopping"></i>
                </div>
                <div>
                    <h1 class="font-bold text-2xl text-blue-700">UNIP</h1>
                    <p class="text-xs tracking-[5px] text-blue-700">MARKET</p>
                </div>
            </div>

            <!-- Search -->
            <div class="w-1/2">
                <div class="relative">
                    <input type="text"
                        placeholder="Cari makanan atau minuman..."
                        class="w-full border rounded-full py-3 px-6 outline-none focus:border-blue-600">

                    <i class="fa-solid fa-magnifying-glass absolute right-5 top-4 text-blue-700"></i>
                </div>
            </div>

            <!-- Menu -->
            <div class="flex items-center gap-6 text-blue-700">
                <button>
                    <i class="fa-regular fa-bell text-2xl"></i>
                </button>
                <button>
                    <i class="fa-solid fa-cart-shopping text-2xl"></i>
                </button>
                <div class="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
                    UN
                </div>
            </div>

        </div>
    </header>

    <!-- CONTENT -->
    <main class="container mx-auto p-6">

        <!-- Welcome -->
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800">Halo, Selamat Datang!</h2>
            <p class="text-gray-500">Mau makan atau minum apa hari ini?</p>
        </div>

        <!-- Banner -->
        <section class="grid lg:grid-cols-4 gap-6 mb-8">
            <div class="lg:col-span-3 bg-gradient-to-r from-blue-800 to-blue-600 rounded-3xl p-10 text-white flex justify-between items-center">
                <div>
                    <p class="text-lg">Promo Spesial</p>
                    <h1 class="text-5xl font-bold my-4">Makan Enak,<br>Hemat Maksimal!</h1>
                    <button class="mt-4 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold">
                        Belanja Sekarang
                    </button>
                </div>
                <div class="hidden md:block">
                    <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" class="w-72 rounded-xl">
                </div>
            </div>

            <!-- Ringkasan -->
            <div class="bg-white rounded-3xl p-6 shadow">
                <h3 class="font-bold text-blue-700 text-xl mb-6">Ringkasan Belanja</h3>
                <div class="space-y-5">
                    <div class="flex justify-between">
                        <span>Pesanan Saya</span>
                        <span class="font-bold text-blue-700">12</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Wishlist</span>
                        <span class="font-bold text-blue-700">8</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Promo Aktif</span>
                        <span class="font-bold text-blue-700">5</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Kategori -->
        <section class="mb-8">
            <div class="flex justify-between mb-4">
                <h3 class="font-bold text-2xl">Kategori</h3>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div class="bg-white p-6 rounded-2xl text-center shadow">🍜<p>Makanan</p></div>
                <div class="bg-white p-6 rounded-2xl text-center shadow">🧋<p>Minuman</p></div>
                <div class="bg-white p-6 rounded-2xl text-center shadow">🍟<p>Snack</p></div>
                <div class="bg-white p-6 rounded-2xl text-center shadow">🍰<p>Dessert</p></div>
                <div class="bg-white p-6 rounded-2xl text-center shadow">🍳<p>Sarapan</p></div>
                <div class="bg-white p-6 rounded-2xl text-center shadow">🍔<p>Cepat Saji</p></div>
            </div>
        </section>

        <!-- Produk -->
        <section>
            <div class="flex justify-between mb-5">
                <h3 class="font-bold text-2xl">Rekomendasi Untukmu</h3>
            </div>
            <div id="productContainer" class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                <!-- Produk dirender via JS -->
            </div>
        </section>

    </main>

    <!-- Custom JS (Thymeleaf) -->
    <script th:src="@{/js/dashboard.js}"></script>
</body>
</html>
```

### 2. dashboard.css
```css
*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'Poppins',sans-serif;
}

body{
    background:#f5f7fb;
}

/* HEADER */
.header{
    background:#fff;
    height:90px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:0 50px;
    box-shadow:0 2px 15px rgba(0,0,0,.05);
}

.logo{
    display:flex;
    align-items:center;
    gap:10px;
}

.logo img{
    width:55px;
}

.logo-text h1{
    color:#0F4CFF;
    font-size:30px;
    font-weight:700;
}

.logo-text p{
    color:#0F4CFF;
    letter-spacing:5px;
    font-size:12px;
}

.search-box{
    width:500px;
    position:relative;
}

.search-box input{
    width:100%;
    height:50px;
    border:1px solid #ddd;
    border-radius:30px;
    padding:0 20px;
    outline:none;
}

.search-box i{
    position:absolute;
    right:20px;
    top:17px;
    color:#0F4CFF;
}

.header-menu{
    display:flex;
    align-items:center;
    gap:25px;
}

.profile{
    width:50px;
    height:50px;
    border-radius:50%;
    background:#0F4CFF;
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    font-weight:700;
}

/* CONTENT */
.container{
    width:95%;
    margin:auto;
    margin-top:25px;
}

.welcome h1{
    font-size:35px;
    color:#222;
}

.welcome p{
    color:#666;
}

/* BANNER */
.top-section{
    display:grid;
    grid-template-columns:3fr 1.1fr;
    gap:20px;
    margin-top:20px;
}

.banner{
    background:linear-gradient(
    135deg,
    #0036d8,
    #0F4CFF,
    #1f66ff
    );
    border-radius:25px;
    padding:40px;
    color:white;
    display:flex;
    justify-content:space-between;
    align-items:center;
    min-height:300px;
}

.banner h1{
    font-size:55px;
    line-height:60px;
}

.banner p{
    margin-top:15px;
    opacity:.9;
}

.banner button{
    margin-top:20px;
    background:white;
    color:#0F4CFF;
    border:none;
    padding:14px 30px;
    border-radius:12px;
    font-weight:600;
    cursor:pointer;
}

.banner img{
    width:320px;
}

/* SUMMARY */
.summary{
    background:white;
    border-radius:25px;
    padding:25px;
}

.summary h2{
    color:#0F4CFF;
    margin-bottom:20px;
}

.summary-item{
    display:flex;
    justify-content:space-between;
    margin-bottom:25px;
}

.summary-item span:last-child{
    color:#0F4CFF;
    font-weight:700;
}

/* CATEGORY */
.category{
    margin-top:30px;
}

.category-title{
    font-size:28px;
    font-weight:600;
    margin-bottom:20px;
}

.category-grid{
    display:grid;
    grid-template-columns:repeat(6,1fr);
    gap:20px;
}

.category-card{
    background:white;
    border-radius:20px;
    padding:25px;
    text-align:center;
    box-shadow:0 3px 15px rgba(0,0,0,.05);
    transition:.3s;
}

.category-card:hover{
    transform:translateY(-5px);
}

.category-card i{
    color:#0F4CFF;
    font-size:35px;
    margin-bottom:10px;
}

/* PRODUCTS */
.product-section{
    margin-top:35px;
}

.product-grid{
    display:grid;
    grid-template-columns:repeat(5,1fr);
    gap:20px;
}

.product-card{
    background:white;
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 3px 15px rgba(0,0,0,.05);
}

.product-card img{
    width:100%;
    height:180px;
    object-fit:cover;
}

.product-info{
    padding:15px;
}

.product-info h3{
    font-size:18px;
    margin-bottom:10px;
}

.price{
    color:#0F4CFF;
    font-weight:700;
    font-size:18px;
}

.product-footer{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:15px;
}

.add-btn{
    width:40px;
    height:40px;
    border:none;
    border-radius:10px;
    background:#0F4CFF;
    color:white;
    font-size:20px;
    cursor:pointer;
}

/* POPULER */
.bottom-layout{
    display:grid;
    grid-template-columns:3fr 1.2fr;
    gap:20px;
}

.popular{
    background:white;
    border-radius:25px;
    padding:25px;
}

.popular-item{
    display:flex;
    align-items:center;
    margin-bottom:20px;
}

.popular-item img{
    width:70px;
    height:70px;
    border-radius:15px;
    object-fit:cover;
}

.popular-info{
    margin-left:15px;
}

.popular-info h4{
    margin-bottom:5px;
}

.popular-info p{
    color:#0F4CFF;
    font-weight:700;
}

/* FOOTER INFO */
.footer-info{
    margin-top:30px;
    background:linear-gradient(
    90deg,
    #0036d8,
    #0F4CFF
    );
    color:white;
    border-radius:20px;
    display:grid;
    grid-template-columns:repeat(4,1fr);
    padding:25px;
}

.info-box{
    text-align:center;
}

.info-box i{
    font-size:35px;
    margin-bottom:10px;
}
```

### 3. dashboard.js
```javascript
const products = [
    {
        name: "Nasi Ayam Geprek",
        price: "20.000",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500"
    },
    {
        name: "Mie Goreng Special",
        price: "18.000",
        image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500"
    },
    {
        name: "Es Kopi Susu",
        price: "16.000",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500"
    },
    {
        name: "Thai Tea",
        price: "15.000",
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500"
    },
    {
        name: "Cheese Burger",
        price: "22.000",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
    }
];

const container = document.getElementById("productContainer");

if (container) {
    products.forEach(product => {
        container.innerHTML += `
            <div class="bg-white rounded-2xl shadow overflow-hidden">
                <img src="${product.image}" class="w-full h-44 object-cover">
                <div class="p-4">
                    <h4 class="font-semibold">${product.name}</h4>
                    <div class="flex justify-between items-center mt-3">
                        <span class="font-bold text-blue-700">Rp ${product.price}</span>
                        <button class="bg-blue-700 text-white w-10 h-10 rounded-lg">+</button>
                    </div>
                </div>
            </div>
        `;
    });
}
```
