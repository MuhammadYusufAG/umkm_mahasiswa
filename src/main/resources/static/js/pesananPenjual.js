let pesananData = [];
let currentTab = 'Semua';

const statusConfig = {
    'BARU': { badge: 'bg-yellow-100 text-yellow-700', btn: 'bg-blue-600 text-white', label: 'Proses Pesanan', next: 'DIPROSES' },
    'DIPROSES': { badge: 'bg-blue-100 text-blue-700', btn: 'bg-green-600 text-white', label: 'Tandai Selesai', next: 'SELESAI' },
    'SELESAI': { badge: 'bg-green-100 text-green-700', btn: null },
    'DIBATALKAN': { badge: 'bg-red-100 text-red-600', btn: null },
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

function updateNewCount() {
    fetch('/api/orders/seller/count/new')
        .then(res => res.json())
        .then(data => {
            const badges = document.querySelectorAll('.badge-baru');
            badges.forEach(b => {
                b.textContent = data.count;
                b.style.display = data.count > 0 ? 'inline-block' : 'none';
            });
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
        const itemsStr = p.items && p.items.length > 0 ? p.items.map(i => `${i.productName} x${i.quantity}`).join(', ') : '-';
        
        // format time
        const date = new Date(p.createdAt);
        const waktu = date.toLocaleString('id-ID');

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
            <div><span class="text-gray-400">Produk:</span> <span class="font-medium text-gray-700">${itemsStr}</span></div>
            <div><span class="text-gray-400">Total:</span> <span class="font-bold text-blue-600">Rp ${p.totalPrice ? p.totalPrice.toLocaleString('id-ID') : 0}</span></div>
            <div><span class="text-gray-400">Catatan:</span> <span class="text-gray-600 italic">${p.notes || '-'}</span></div>
        </div>
    </div>
    <div class="flex gap-2 shrink-0">
        ${cfg.btn && p.status === 'BARU' ? `<button onclick="prosesPesanan(${p.id})" class="${cfg.btn} px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">${cfg.label}</button>` : ''}
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
    fetch(`/api/orders/${id}/process`, { method: 'PATCH' })
        .then(res => {
            if (res.ok) {
                fetchOrders();
            } else {
                alert('Gagal memproses pesanan');
            }
        })
        .catch(err => console.error(err));
}

fetchOrders();
