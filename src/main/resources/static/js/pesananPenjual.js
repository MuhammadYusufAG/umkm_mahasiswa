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
            <div><span class="text-gray-400">Catatan Chat:</span> <span class="text-gray-600 italic">${p.notes ? p.notes.replace(/\\n/g, '<br>') : '-'}</span></div>
        </div>
    </div>
    <div class="flex gap-2 shrink-0">
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
