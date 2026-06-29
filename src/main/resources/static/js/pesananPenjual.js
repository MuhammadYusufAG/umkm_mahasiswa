const pesananData = [
    { id: '#ORD-001', pembeli: 'Arif Santoso', produk: 'Nasi Goreng Spesial', jumlah: 2, total: 30000, catatan: 'Pedas ya kak', waktu: '10 menit lalu', status: 'Baru' },
    { id: '#ORD-002', pembeli: 'Dina Lestari', produk: 'Kopi Susu Gula Aren', jumlah: 1, total: 12000, catatan: '-', waktu: '25 menit lalu', status: 'Baru' },
    { id: '#ORD-003', pembeli: 'Rizky Pratama', produk: 'Dimsum Ayam', jumlah: 3, total: 24000, catatan: 'Jangan lupa saosnya', waktu: '1 jam lalu', status: 'Baru' },
    { id: '#ORD-004', pembeli: 'Sari Dewi', produk: 'Teh Tarik', jumlah: 2, total: 16000, catatan: '-', waktu: '2 jam lalu', status: 'Diproses' },
    { id: '#ORD-005', pembeli: 'Budi Santoso', produk: 'Donat Gula Halus', jumlah: 5, total: 25000, catatan: 'Tolong dikemas rapi', waktu: '3 jam lalu', status: 'Selesai' },
    { id: '#ORD-006', pembeli: 'Maya Putri', produk: 'Es Teh Manis', jumlah: 1, total: 8000, catatan: '-', waktu: '5 jam lalu', status: 'Dibatalkan' },
];

const statusConfig = {
    'Baru': { badge: 'bg-yellow-100 text-yellow-700', btn: 'bg-blue-600 text-white', label: 'Proses Pesanan', next: 'Diproses' },
    'Diproses': { badge: 'bg-blue-100 text-blue-700', btn: 'bg-green-600 text-white', label: 'Tandai Selesai', next: 'Selesai' },
    'Selesai': { badge: 'bg-green-100 text-green-700', btn: null },
    'Dibatalkan': { badge: 'bg-red-100 text-red-600', btn: null },
};

function renderPesanan(list) {
    const container = document.getElementById('daftarPesanan');
    if (list.length === 0) {
        container.innerHTML = `<div class="bg-white rounded-2xl p-12 text-center text-gray-400 shadow">
    <i class="fa-solid fa-inbox text-4xl mb-3"></i><p>Tidak ada pesanan</p></div>`;
        return;
    }
    container.innerHTML = list.map((p, idx) => {
        const cfg = statusConfig[p.status];
        return `
<div class="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center gap-4">
    <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
            <span class="font-bold text-gray-800">${p.id}</span>
            <span class="badge ${cfg.badge}">${p.status}</span>
            <span class="text-xs text-gray-400 ml-auto">${p.waktu}</span>
        </div>
        <div class="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div><span class="text-gray-400">Pembeli:</span> <span class="font-medium text-gray-700">${p.pembeli}</span></div>
            <div><span class="text-gray-400">Produk:</span> <span class="font-medium text-gray-700">${p.produk} x${p.jumlah}</span></div>
            <div><span class="text-gray-400">Total:</span> <span class="font-bold text-blue-600">Rp ${p.total.toLocaleString('id-ID')}</span></div>
            <div><span class="text-gray-400">Catatan:</span> <span class="text-gray-600 italic">${p.catatan}</span></div>
        </div>
    </div>
    <div class="flex gap-2 shrink-0">
        ${cfg.btn ? `<button onclick="updateStatus(${idx})" class="${cfg.btn} px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">${cfg.label}</button>` : ''}
        ${p.status === 'Baru' ? `<button onclick="batalkan(${idx})" class="border border-red-200 text-red-500 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition">Batalkan</button>` : ''}
    </div>
</div>`;
    }).join('');
}

let currentTab = 'Semua';

function filterTab(tab, btn) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = tab === 'Semua' ? pesananData : pesananData.filter(p => p.status === tab);
    renderPesanan(filtered);
}

function updateStatus(idx) {
    const p = pesananData[idx];
    const next = statusConfig[p.status].next;
    if (next) {
        pesananData[idx].status = next;
        filterTab(currentTab, document.querySelector('.tab-btn.active'));
    }
}

function batalkan(idx) {
    if (confirm('Yakin ingin membatalkan pesanan ini?')) {
        pesananData[idx].status = 'Dibatalkan';
        filterTab(currentTab, document.querySelector('.tab-btn.active'));
    }
}

renderPesanan(pesananData);
