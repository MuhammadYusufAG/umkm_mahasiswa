// ==========================
// AMBIL DATA PESANAN DARI SESSIONSTORAGE
// ==========================

function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

// DOM elements for tracking status

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

let activeOrderId = null;
let myOrders = [];

function renderOrderSelector(orders) {
    const container = document.getElementById("orderSelectorContainer");
    const list = document.getElementById("orderList");
    if (!container || !list) return;

    if (orders.length <= 1) {
        container.classList.add("hidden");
        return;
    }

    container.classList.remove("hidden");
    list.innerHTML = orders.map(order => {
        const isActive = order.id == activeOrderId;
        const activeClass = isActive 
            ? "bg-blue-700 text-white font-bold" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200";
        return `
            <button type="button" onclick="pilihPesananAktif(${order.id})" class="px-4 py-2 rounded-2xl text-xs shrink-0 transition ${activeClass}">
                #ORD-${order.id} (${order.sellerName || '-'})
            </button>
        `;
    }).join("");
}

function pilihPesananAktif(id) {
    activeOrderId = id;
    const activeOrder = myOrders.find(o => o.id == activeOrderId);
    if (activeOrder) {
        displayOrderDetails(activeOrder);
        renderOrderSelector(myOrders);
    }
}

function renderChatHistory(order) {
    if (!chatBox) return;

    // Hindari render ulang jika notes tidak berubah untuk mencegah scroll jump
    const currentNotes = order.notes || "";
    const lastNotes = chatBox.getAttribute("data-last-notes");
    if (lastNotes === currentNotes && chatBox.innerHTML.trim() !== "") {
        return;
    }
    chatBox.setAttribute("data-last-notes", currentNotes);

    chatBox.innerHTML = `
        <div class="flex">
            <div class="bg-gray-100 rounded-2xl px-4 py-2 max-w-[75%] text-sm">
                Halo, terima kasih sudah memesan! Pesananmu sedang kami konfirmasi ya 🙏
            </div>
        </div>
    `;
    
    if (order.notes) {
        const lines = order.notes.split("\n");
        lines.forEach(line => {
            let msg = line.trim();
            if (msg.startsWith("- ")) {
                msg = msg.substring(2);
            }
            if (msg) {
                // Render message bubble
                const bubble = document.createElement("div");
                bubble.className = "flex justify-end";
                bubble.innerHTML = `
                    <div class="bg-blue-700 text-white rounded-2xl px-4 py-2 max-w-[75%] text-sm">
                        ${msg}
                    </div>
                `;
                chatBox.appendChild(bubble);
            }
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function displayOrderDetails(order) {
    // Update ringkasan UI
    if (order.items && order.items.length > 0) {
        let itemsHtml = `
            <div class="flex items-center justify-between pb-2 border-b border-gray-200">
                <span class="text-xs font-bold text-gray-500">Toko: ${order.sellerName || '-'}</span>
                <span class="text-xs font-bold text-blue-700">#ORD-${order.id}</span>
            </div>
        `;
        
        order.items.forEach(item => {
            const img = item.productImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
            itemsHtml += `
                <div class="flex items-start gap-3 py-2 ${order.items.indexOf(item) > 0 ? 'border-t border-gray-100' : ''}">
                    <img src="${img}" class="w-12 h-12 object-cover rounded-xl mt-0.5">
                    <div class="flex-1">
                        <p class="font-semibold text-sm text-gray-800">${item.productName}</p>
                        <p class="text-xs text-gray-500 mt-0.5">${item.quantity}x @ ${formatRupiah(item.price)}</p>
                        ${item.notes ? `<p class="text-[11px] text-red-600 italic mt-0.5">Catatan: ${item.notes}</p>` : ''}
                    </div>
                    <p class="font-bold text-sm text-gray-800 mt-0.5">${formatRupiah(item.price * item.quantity)}</p>
                </div>
            `;
        });

        itemsHtml += `
            <div class="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-bold mt-2">
                <span class="text-gray-700">Total Pembayaran</span>
                <span class="text-blue-700 text-base">${formatRupiah(order.totalPrice)}</span>
            </div>
        `;

        const ringkasanContainer = document.getElementById("ringkasanProduk");
        if (ringkasanContainer) {
            ringkasanContainer.innerHTML = itemsHtml;
            ringkasanContainer.classList.remove("hidden");
        }
    }
    
    // Reset status UI
    if (btnPesananSelesai) {
        btnPesananSelesai.className = "w-full bg-gray-300 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed transition";
        btnPesananSelesai.textContent = "Pesanan Selesai";
        btnPesananSelesai.disabled = true;
    }
    if (btnKonfirmasiPenjual) {
        btnKonfirmasiPenjual.className = "w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition";
        btnKonfirmasiPenjual.disabled = false;
    }

    // Update status UI
    if (order.status === 'BARU') {
        tandaiBaru();
    } else if (order.status === 'DIPROSES') {
        tandaiSudahDikonfirmasi();
    } else if (order.status === 'SELESAI') {
        tandaiSudahDikonfirmasi();
        tandaiPesananSelesai();
    } else if (order.status === 'DIBATALKAN') {
        statusIcon.innerHTML = `
            <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <i class="fa-solid fa-circle-xmark text-2xl text-red-600"></i>
            </div>
        `;
        statusJudul.textContent = "Pesanan Dibatalkan";
        statusKeterangan.textContent = "Pesanan Anda telah dibatalkan.";
        
        iconKonfirmasi.classList.remove("bg-blue-700", "text-white");
        iconKonfirmasi.classList.add("bg-gray-200", "text-gray-400");
        lineSatu.classList.remove("bg-blue-700");
        lineSatu.classList.add("bg-gray-200");
        iconSelesai.classList.remove("bg-green-600", "text-white");
        iconSelesai.classList.add("bg-gray-200", "text-gray-400");
        lineDua.classList.remove("bg-green-600");
        lineDua.classList.add("bg-gray-200");
        
        if (btnKonfirmasiPenjual) btnKonfirmasiPenjual.disabled = true;
        if (btnPesananSelesai) btnPesananSelesai.disabled = true;
    }

    renderChatHistory(order);
}

// Fetch dari Backend API
function fetchMyOrders() {
    fetch('/api/orders/buyer')
        .then(res => {
            if(!res.ok) throw new Error("Unauthorized");
            return res.json();
        })
        .then(orders => {
            myOrders = orders;
            if (orders && orders.length > 0) {
                // Render Selector
                renderOrderSelector(orders);
                
                // Set active order if not set
                if (!activeOrderId || !orders.some(o => o.id == activeOrderId)) {
                    activeOrderId = orders[0].id;
                }
                
                const activeOrder = orders.find(o => o.id == activeOrderId) || orders[0];
                displayOrderDetails(activeOrder);
            } else {
                document.getElementById("orderSelectorContainer").classList.add("hidden");
                document.getElementById("ringkasanProduk").classList.add("hidden");
            }
        })
        .catch(err => {
            console.error(err);
            // fallback
            const dataPesanan = JSON.parse(sessionStorage.getItem("pesananTerakhir"));
            const ringkasanContainer = document.getElementById("ringkasanProduk");
            if(dataPesanan && ringkasanContainer) {
                const img = dataPesanan.gambar || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                const totalVal = dataPesanan.harga * dataPesanan.qty;
                ringkasanContainer.innerHTML = `
                    <div class="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span class="text-xs font-bold text-gray-500">Toko: Toko Penjual</span>
                    </div>
                    <div class="flex items-start gap-3 py-2">
                        <img src="${img}" class="w-12 h-12 object-cover rounded-xl mt-0.5 animate-fade-in">
                        <div class="flex-1">
                            <p class="font-semibold text-sm text-gray-800">${dataPesanan.nama}</p>
                            <p class="text-xs text-gray-500 mt-0.5">${dataPesanan.qty}x @ ${formatRupiah(dataPesanan.harga)}</p>
                        </div>
                        <p class="font-bold text-sm text-gray-800 mt-0.5">${formatRupiah(totalVal)}</p>
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-bold mt-2">
                        <span class="text-gray-700">Total Pembayaran</span>
                        <span class="text-blue-700 text-base">${formatRupiah(totalVal)}</span>
                    </div>
                `;
                ringkasanContainer.classList.remove("hidden");
            } else if (ringkasanContainer) {
                ringkasanContainer.classList.add("hidden");
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
    if (!chatBox) return;
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
    if (activeOrderId) {
        fetch(`/api/orders/${activeOrderId}/notes`, {
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

if (btnKirimChat) btnKirimChat.addEventListener("click", kirimChat);

if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            kirimChat();
        }
    });
}
