let pesananData = [];
let currentTab = 'Semua';

const statusConfig = {
    'BARU': { badge: 'bg-yellow-100 text-yellow-700' },
    'DIPROSES': { badge: 'bg-blue-100 text-blue-700' },
    'SELESAI': { badge: 'bg-green-100 text-green-700' },
    'DIBATALKAN': { badge: 'bg-red-100 text-red-600' },
};

function fetchOrders() {
    fetch('/api/orders/seller')
        .then(res => res.json())
        .then(data => {
            pesananData = data;
            filterTab(currentTab, document.querySelector('.tab-btn.active') || document.querySelector('.tab-btn'));
            updateNewCount();
        })
        .catch(err => console.error(err));
}

// ==========================================
// LOGIC CHAT PENJUAL (STOMP)
// ==========================================

let stompClientSeller = null;
let currentChatSubSeller = null;
let activeChatOrderId = null;

const modalChat = document.getElementById('modalChat');
const chatBoxSeller = document.getElementById('chatBoxSeller');
const chatInputSeller = document.getElementById('chatInputSeller');
const chatOrderRef = document.getElementById('chatOrderRef');

function bukaChat(orderId) {
    activeChatOrderId = orderId;
    chatOrderRef.textContent = `#ORD-${orderId}`;
    
    // Tampilkan modal
    modalChat.classList.remove('hidden');
    // Animasi muncul
    setTimeout(() => {
        modalChat.classList.remove('opacity-0');
        modalChat.querySelector('div').classList.remove('scale-95');
    }, 10);

    // Bersihkan chat box dan disconnect sebelumnya
    chatBoxSeller.innerHTML = '';
    if (currentChatSubSeller) {
        currentChatSubSeller.unsubscribe();
        currentChatSubSeller = null;
    }

    // Load histori chat
    fetch(`/api/chat/${orderId}`)
        .then(res => res.json())
        .then(messages => {
            chatBoxSeller.innerHTML = '';
            if (messages && messages.length > 0) {
                messages.forEach(msg => {
                    tambahBubbleSeller(msg.content, msg.senderRole === "SELLER" ? "saya" : "pembeli");
                });
            }
            // Konek websocket
            connectStompSeller(orderId);
        })
        .catch(err => console.error("Gagal load histori chat", err));
}

function tutupChat() {
    // Animasi hilang
    modalChat.classList.add('opacity-0');
    modalChat.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modalChat.classList.add('hidden');
    }, 300);

    if (currentChatSubSeller) {
        currentChatSubSeller.unsubscribe();
        currentChatSubSeller = null;
    }
    activeChatOrderId = null;
}

function connectStompSeller(orderId) {
    const socket = new SockJS('/ws');
    stompClientSeller = Stomp.over(socket);
    stompClientSeller.debug = null;
    stompClientSeller.connect({}, function (frame) {
        currentChatSubSeller = stompClientSeller.subscribe('/topic/chat/' + orderId, function (messageOutput) {
            const msg = JSON.parse(messageOutput.body);
            // Tampilkan jika yang mengirim adalah pembeli
            if (msg.senderRole === "BUYER") {
                tambahBubbleSeller(msg.content, "pembeli");
            }
        });
    });
}

function tambahBubbleSeller(teks, pengirim) {
    if (!chatBoxSeller) return;
    const bubble = document.createElement("div");

    if (pengirim === "saya") {
        bubble.className = "flex justify-end";
        bubble.innerHTML = `
            <div class="bg-blue-700 text-white rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm">
                ${teks}
            </div>
        `;
    } else {
        bubble.className = "flex";
        bubble.innerHTML = `
            <div class="bg-white border border-gray-100 rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm">
                ${teks}
            </div>
        `;
    }

    chatBoxSeller.appendChild(bubble);
    chatBoxSeller.scrollTop = chatBoxSeller.scrollHeight;
}

function kirimChatSeller() {
    const teks = chatInputSeller.value.trim();
    if (!teks || !activeChatOrderId || !stompClientSeller) return;

    tambahBubbleSeller(teks, "saya");
    chatInputSeller.value = "";

    const payload = {
        content: teks,
        senderRole: "SELLER"
    };
    stompClientSeller.send("/app/chat/" + activeChatOrderId + "/send", {}, JSON.stringify(payload));
}

if (chatInputSeller) {
    chatInputSeller.addEventListener("keydown", (e) => {
        if (e.key === "Enter") kirimChatSeller();
    });
}

function renderPesanan(list) {
    const container = document.getElementById('daftarPesanan');
    if (list.length === 0) {
        container.innerHTML = `<div class="bg-white rounded-2xl p-12 text-center text-gray-400 shadow">
    <i class="fa-solid fa-inbox text-4xl mb-3"></i><p>Tidak ada pesanan</p></div>`;
        return;
    }
    container.innerHTML = list.map((p, idx) => {
        const cfg = statusConfig[p.status] || statusConfig['BARU'];
        
        // format items
        const itemsHtml = p.items && p.items.length > 0 ? p.items.map(i => `
            <div class="mb-1 text-gray-700">
                • <span class="font-semibold text-gray-800">${i.productName}</span> x${i.quantity}
                ${i.notes ? `<span class="text-xs text-red-600 italic block pl-3">Catatan: ${i.notes}</span>` : ''}
            </div>
        `).join('') : '-';
        
        // format time
        const date = new Date(p.createdAt);
        const waktu = date.toLocaleString('id-ID');

        let actionBtns = '';
        if (p.status === 'BARU') {
            actionBtns = `
                <button onclick="prosesPesanan(${p.id})" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">Terima</button>
                <button onclick="batalkanPesanan(${p.id})" class="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-200 transition">Batalkan</button>
            `;
        } else if (p.status === 'DIPROSES') {
            actionBtns = `
                <button onclick="selesaikanPesanan(${p.id})" class="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">Selesai</button>
                <button onclick="batalkanPesanan(${p.id})" class="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-200 transition">Batalkan</button>
            `;
        } else if (p.status === 'SELESAI' || p.status === 'DIBATALKAN') {
            actionBtns = `
                <button onclick="hapusPesanan(${p.id})" class="border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition" title="Hapus Riwayat Pesanan">
                    <i class="fa-solid fa-trash mr-1"></i> Hapus
                </button>
            `;
        }

        const chatBtn = `
            <button onclick="bukaChat(${p.id})" class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-200 transition">
                <i class="fa-regular fa-comment-dots mr-1"></i> Chat
            </button>
        `;

        return `
<div class="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center gap-4">
    <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
            <span class="font-bold text-gray-800">#ORD-${p.id}</span>
            <span class="badge ${cfg.badge}">${p.status}</span>
            <span class="text-xs text-gray-400 ml-auto">${waktu}</span>
        </div>
        <div class="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div><span class="text-gray-400">Pembeli:</span> <span class="font-medium text-gray-700">${p.buyerName || 'Unknown'}</span></div>
            <div>
                <span class="text-gray-400 block mb-1">Produk:</span> 
                <div class="pl-2 border-l-2 border-blue-500">${itemsHtml}</div>
            </div>
            <div><span class="text-gray-400">Total:</span> <span class="font-bold text-blue-600">Rp ${p.totalPrice ? p.totalPrice.toLocaleString('id-ID') : 0}</span></div>
        </div>
    </div>
    <div class="flex gap-2 shrink-0">
        ${chatBtn}
        ${actionBtns}
    </div>
</div>`;
    }).join('');
}

function filterTab(tab, btn) {
    currentTab = tab;
    if(btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    
    let statusFilter = null;
    if(tab === 'Baru') statusFilter = 'BARU';
    if(tab === 'Diproses') statusFilter = 'DIPROSES';
    if(tab === 'Selesai') statusFilter = 'SELESAI';
    if(tab === 'Dibatalkan') statusFilter = 'DIBATALKAN';

    const filtered = statusFilter ? pesananData.filter(p => p.status === statusFilter) : pesananData;
    renderPesanan(filtered);
}

function prosesPesanan(id) {
    if (confirm('Terima pesanan ini?')) {
        fetch(`/api/orders/${id}/process`, { method: 'PATCH' })
            .then(res => {
                if (res.ok) fetchOrders();
                else alert('Gagal memproses pesanan');
            })
            .catch(err => console.error(err));
    }
}

function selesaikanPesanan(id) {
    if (confirm('Tandai pesanan selesai?')) {
        fetch(`/api/orders/${id}/complete`, { method: 'PATCH' })
            .then(res => {
                if (res.ok) fetchOrders();
                else alert('Gagal menyelesaikan pesanan');
            })
            .catch(err => console.error(err));
    }
}

function batalkanPesanan(id) {
    if (confirm('Batalkan pesanan ini?')) {
        fetch(`/api/orders/${id}/cancel`, { method: 'PATCH' })
            .then(res => {
                if (res.ok) fetchOrders();
                else alert('Gagal membatalkan pesanan');
            })
            .catch(err => console.error(err));
    }
}

function hapusPesanan(id) {
    if (confirm('Hapus riwayat pesanan ini dari database?')) {
        fetch(`/api/orders/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    fetchOrders();
                } else {
                    res.json().then(err => alert(err.error || 'Gagal menghapus pesanan'));
                }
            })
            .catch(err => console.error(err));
    }
}

fetchOrders();
