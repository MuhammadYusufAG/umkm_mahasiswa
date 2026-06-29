// ==========================
// DATA PRODUK
// ==========================

const products = [
    {
        name: "Nasi Ayam Geprek",
        price: "20.000",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500"
    },
    {
        name: "Mie Goreng Special",
        price: "18.000",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500"
    },
    {
        name: "Es Kopi Susu",
        price: "16.000",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500"
    },
    {
        name: "Thai Tea",
        price: "15.000",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500"
    },
    {
        name: "Cheese Burger",
        price: "22.000",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
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
        container.innerHTML += `
            <div class="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="w-full h-44 object-cover">

                <div class="p-4">

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

                    <div class="flex justify-between items-center mt-3">

                        <span class="font-bold text-blue-700">
                            Rp ${product.price}
                        </span>

                        <button class="bg-blue-700 text-white w-10 h-10 rounded-lg hover:bg-blue-800 transition">
                            +
                        </button>

                    </div>

                </div>

            </div>
        `;
    });
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