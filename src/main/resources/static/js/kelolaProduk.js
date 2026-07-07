if (!window.showToast) {
    const script = document.createElement('script');
    script.src = '/js/toast.js';
    script.async = false;
    document.head.appendChild(script);
}

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
    <td class="px-6 py-4 flex items-center gap-3">
        <img src="${p.imageUrl || 'https://placehold.co/100x100?text=No+Image'}" class="w-10 h-10 object-cover rounded-lg border" onerror="this.src='https://placehold.co/100x100?text=No+Image'">
        <div>
            <p class="font-semibold text-gray-800">${p.name}</p>
            <p class="text-xs text-gray-400">${p.description || '-'}</p>
        </div>
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
        ['inputNama', 'inputHarga', 'inputStok', 'inputDeskripsi', 'inputBahan'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('inputKategori').value = '';
        document.getElementById('inputStatus').value = 'Aktif';
        document.getElementById('inputFoto').value = '';
        document.getElementById('previewContainer').classList.add('hidden');
        document.getElementById('imagePreview').src = '';
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
    document.getElementById('inputBahan').value = p.ingredients || '';
    
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    document.getElementById('inputFoto').value = '';
    
    if (p.imageUrl) {
        imagePreview.src = p.imageUrl;
        previewContainer.classList.remove('hidden');
    } else {
        imagePreview.src = '';
        previewContainer.classList.add('hidden');
    }
    
    openModal(false);
}

async function toggleStatus(id) {
    if(confirm('Yakin ingin mengubah status produk ini?')) {
        try {
            const res = await fetch('/api/products/seller/' + id + '/toggle-status', { method: 'PATCH' });
            if(res.ok) {
                fetchProducts();
                showToast('Status produk berhasil diubah!', 'success');
            }
            else showToast('Gagal merubah status', 'error');
        } catch(e) { console.error(e); }
    }
}

async function hapusProduk(id) {
    if (confirm('Yakin ingin menghapus produk ini?')) {
        try {
            const res = await fetch('/api/products/seller/' + id, { method: 'DELETE' });
            if(res.ok) {
                fetchProducts();
                showToast('Produk berhasil dihapus!', 'success');
            }
            else showToast('Gagal menghapus produk', 'error');
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
    const ingredients = document.getElementById('inputBahan').value.trim();

    if (!name || !category || !price || isNaN(stock)) {
        showToast('Mohon lengkapi semua field wajib!', 'error');
        return;
    }

    let imageUrl = '';
    if (editId) {
        const existingProduct = produkList.find(x => x.id === editId);
        if (existingProduct) {
            imageUrl = existingProduct.imageUrl || '';
        }
    }

    const fileInput = document.getElementById('inputFoto');
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran file maksimal 2MB!', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const uploadRes = await fetch('/api/products/seller/upload', {
                method: 'POST',
                body: formData
            });
            if (!uploadRes.ok) {
                showToast('Gagal mengunggah foto produk!', 'error');
                return;
            }
            const uploadResult = await uploadRes.json();
            imageUrl = uploadResult.url;
        } catch (e) {
            console.error(e);
            showToast('Terjadi kesalahan saat mengunggah foto!', 'error');
            return;
        }
    }

    const payload = { name, category, price, stock, isActive, description, ingredients, imageUrl };
    
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
            showToast('Produk berhasil disimpan!', 'success');
        } else {
            showToast('Gagal menyimpan produk', 'error');
        }
    } catch(e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    const inputFoto = document.getElementById('inputFoto');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('previewContainer');
    
    if (inputFoto) {
        inputFoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    showToast('Ukuran file maksimal 2MB!', 'error');
                    inputFoto.value = '';
                    previewContainer.classList.add('hidden');
                    imagePreview.src = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    imagePreview.src = event.target.result;
                    previewContainer.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                previewContainer.classList.add('hidden');
                imagePreview.src = '';
            }
        });
    }
});
