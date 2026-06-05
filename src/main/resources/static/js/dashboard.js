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
