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

}


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

let stompClient = null;
let currentChatSubscription = null;

function renderChatHistory(order) {
    if (!chatBox) return;

    // Bersihkan chat box
    chatBox.innerHTML = '';
    
    // Disconnect langganan STOMP sebelumnya jika ada
    if (currentChatSubscription) {
        currentChatSubscription.unsubscribe();
        currentChatSubscription = null;
    }

    // Ambil history chat via REST API
    fetch(`/api/chat/${order.id}`)
        .then(res => res.json())
        .then(messages => {
            chatBox.innerHTML = '';
            
            // Pesan sambutan
            const welcomeBubble = document.createElement("div");
            welcomeBubble.className = "flex";
            welcomeBubble.innerHTML = `
                <div class="bg-gray-100 rounded-2xl px-4 py-2 max-w-[75%] text-sm">
                    Halo, ada yang bisa kami bantu terkait pesanan ini?
                </div>
            `;
            chatBox.appendChild(welcomeBubble);

            // Tampilkan history
            if (messages && messages.length > 0) {
                messages.forEach(msg => {
                    tambahChat(msg.content, msg.senderRole === "BUYER" ? "saya" : "penjual");
                });
            }
            
            // Koneksi STOMP
            connectStomp(order.id);
        })
        .catch(err => console.error("Gagal memuat histori chat", err));
}

function connectStomp(orderId) {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // Matikan log debug
    stompClient.connect({}, function (frame) {
        currentChatSubscription = stompClient.subscribe('/topic/chat/' + orderId, function (messageOutput) {
            const msg = JSON.parse(messageOutput.body);
            // Jika yang kirim bukan saya, tampilkan di kiri (penjual)
            // Karena ini halaman pembeli, maka pesan BUYER adalah "saya", SELLER adalah "penjual"
            if (msg.senderRole === "SELLER") {
                tambahChat(msg.content, "penjual");
            }
        });
    });
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

    if (!teks || !activeOrderId || !stompClient) {
        return;
    }

    // Tampilkan di UI saya sendiri langsung biar cepat
    tambahChat(teks, "saya");
    chatInput.value = "";

    // Kirim ke WebSocket STOMP
    const payload = {
        content: teks,
        senderRole: "BUYER"
    };
    stompClient.send("/app/chat/" + activeOrderId + "/send", {}, JSON.stringify(payload));
}

if (btnKirimChat) btnKirimChat.addEventListener("click", kirimChat);

if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            kirimChat();
        }
    });
}
