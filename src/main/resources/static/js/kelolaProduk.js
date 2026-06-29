let produkList = [];
let editId = null;

async function fetchProducts() {
    try {
        const res = await fetch('/api/products/seller');
        if (res.ok) {
            produkList = await res.json();
            filterProduk();
        } else if (res.status === 401 || res.status === 403) {
            window.location.href = '/login';
        }
    } catch(e) {
        console.error(e);
    }
}

function renderTabel(list) {
    const tbody = document.getElementById('tabelProduk');
    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-gray-400">Tidak ada produk ditemukan</td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(p => `
<tr class="hover:bg-gray-50 transition ${!p.isActive ? 'opacity-50' : ''}">
    <td class="px-6 py-4">
        <p class="font-semibold text-gray-800">${p.name}</p>
        <p class="text-xs text-gray-400">${p.description || '-'}</p>
    </td>
    <td class="px-6 py-4 text-gray-500">${p.category || '-'}</td>
    <td class="px-6 py-4 font-semibold text-blue-600">Rp ${p.price.toLocaleString('id-ID')}</td>
    <td class="px-6 py-4">
        <span class="${p.stock <= 5 ? 'text-red-500 font-bold' : 'text-gray-700'}">${p.stock}</span>
        ${p.stock <= 5 ? '<span class="badge bg-red-100 text-red-500 ml-1">Menipis</span>' : ''}
    </td>
    <td class="px-6 py-4">
        <span class="badge ${p.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}">${p.isActive ? 'Aktif' : 'Nonaktif'}</span>
    </td>
    <td class="px-6 py-4">
        <div class="flex gap-2">
            <button onclick="editProduk(${p.id})" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center">
                <i class="fa-solid fa-pen-to-square text-xs"></i>
            </button>
            <button onclick="toggleStatus(${p.id})" class="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition flex items-center justify-center" title="Toggle Status">
                <i class="fa-solid fa-power-off text-xs"></i>
            </button>
            <button onclick="hapusProduk(${p.id})" class="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition flex items-center justify-center">
                <i class="fa-solid fa-trash text-xs"></i>
            </button>
        </div>
    </td>
</tr>
`).join('');
}

function filterProduk() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const kategori = document.getElementById('filterKategori').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filtered = produkList.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search);
        const matchKategori = (kategori === '' || p.category === kategori);
        
        let matchStatus = true;
        if (statusFilter === 'Aktif') matchStatus = p.isActive;
        if (statusFilter === 'Nonaktif') matchStatus = !p.isActive;
        
        return matchSearch && matchKategori && matchStatus;
    });
    renderTabel(filtered);
}

function openModal(reset = true) {
    if (reset) {
        editId = null;
        document.getElementById('modalTitle').textContent = 'Tambah Produk';
        ['inputNama', 'inputHarga', 'inputStok', 'inputDeskripsi'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('inputKategori').value = '';
        document.getElementById('inputStatus').value = 'Aktif';
    }
    document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
}

function closeModalOutside(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function editProduk(id) {
    editId = id;
    const p = produkList.find(x => x.id === id);
    document.getElementById('modalTitle').textContent = 'Edit Produk';
    document.getElementById('inputNama').value = p.name;
    document.getElementById('inputKategori').value = p.category || '';
    document.getElementById('inputHarga').value = p.price;
    document.getElementById('inputStok').value = p.stock;
    document.getElementById('inputStatus').value = p.isActive ? 'Aktif' : 'Nonaktif';
    document.getElementById('inputDeskripsi').value = p.description || '';
    openModal(false);
}

async function toggleStatus(id) {
    if(confirm('Yakin ingin mengubah status produk ini?')) {
        try {
            const res = await fetch('/api/products/seller/' + id + '/toggle-status', { method: 'PATCH' });
            if(res.ok) fetchProducts();
            else alert('Gagal merubah status');
        } catch(e) { console.error(e); }
    }
}

async function hapusProduk(id) {
    if (confirm('Yakin ingin menghapus produk ini?')) {
        try {
            const res = await fetch('/api/products/seller/' + id, { method: 'DELETE' });
            if(res.ok) fetchProducts();
            else alert('Gagal menghapus produk');
        } catch(e) { console.error(e); }
    }
}

async function simpanProduk() {
    const name = document.getElementById('inputNama').value.trim();
    const category = document.getElementById('inputKategori').value;
    const price = parseInt(document.getElementById('inputHarga').value);
    const stock = parseInt(document.getElementById('inputStok').value);
    const isActive = document.getElementById('inputStatus').value === 'Aktif';
    const description = document.getElementById('inputDeskripsi').value.trim();

    if (!name || !category || !price || isNaN(stock)) {
        alert('Mohon lengkapi semua field wajib!');
        return;
    }

    const payload = { name, category, price, stock, isActive, description };
    
    try {
        let url = '/api/products/seller';
        let method = 'POST';
        if (editId) {
            url += '/' + editId;
            method = 'PUT';
        }
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            closeModal();
            fetchProducts();
        } else {
            alert('Gagal menyimpan produk');
        }
    } catch(e) {
        console.error(e);
    }
}

fetchProducts();
