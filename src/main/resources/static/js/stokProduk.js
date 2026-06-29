let stokData = [];
let restokIdx = null;

async function fetchProducts() {
    try {
        const response = await fetch('/api/products/seller');
        if (response.ok) {
            stokData = await response.json();
            renderStok();
        } else if (response.status === 401 || response.status === 403) {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error("Error fetching products", error);
    }
}

function getStatus(stok, min) {
    min = min || 10; // default min threshold
    if (stok === 0) return { label: 'Habis', cls: 'bg-red-100 text-red-600' };
    if (stok <= min) return { label: 'Menipis', cls: 'bg-yellow-100 text-yellow-600' };
    return { label: 'Aman', cls: 'bg-green-100 text-green-600' };
}

function renderStok() {
    const q = document.getElementById('searchStok').value.toLowerCase();
    const filtered = stokData.filter(s => s.name.toLowerCase().includes(q));

    let aman = 0, menipis = 0, habis = 0;
    stokData.forEach(s => {
        const st = getStatus(s.stock, 10).label;
        if (st === 'Aman') aman++;
        else if (st === 'Menipis') menipis++;
        else habis++;
    });
    document.getElementById('statAman').textContent = aman;
    document.getElementById('statMenipis').textContent = menipis;
    document.getElementById('statHabis').textContent = habis;

    const tbody = document.getElementById('tabelStok');
    tbody.innerHTML = filtered.map((s, i) => {
        const min = 10;
        const st = getStatus(s.stock, min);
        return `
<tr class="hover:bg-gray-50 ${!s.isActive ? 'opacity-50' : ''}">
    <td class="px-6 py-4 font-medium text-gray-800">${s.name}</td>
    <td class="px-6 py-4 text-gray-500">-</td>
    <td class="px-6 py-4">
        <div class="flex items-center gap-2">
            <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full rounded-full ${s.stock === 0 ? 'bg-red-400' : s.stock <= min ? 'bg-yellow-400' : 'bg-green-400'}"
                    style="width:${Math.min(100, (s.stock / Math.max(min * 2, 1)) * 100)}%"></div>
            </div>
            <span class="font-bold ${s.stock === 0 ? 'text-red-500' : s.stock <= min ? 'text-yellow-600' : 'text-gray-700'}">${s.stock}</span>
        </div>
    </td>
    <td class="px-6 py-4 text-gray-500">${min}</td>
    <td class="px-6 py-4"><span class="badge ${st.cls}">${st.label}</span></td>
    <td class="px-6 py-4">
        <button onclick="bukaRestok(${i})" class="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition flex items-center gap-1">
            <i class="fa-solid fa-plus"></i> Restok
        </button>
    </td>
</tr>`;
    }).join('');
}

function bukaRestok(idx) {
    restokIdx = idx;
    const s = stokData[idx];
    document.getElementById('modalNama').textContent = s.name;
    document.getElementById('stokSekarang').value = s.stock;
    document.getElementById('tambahStok').value = '';
    document.getElementById('previewStok').textContent = s.stock;
    document.getElementById('modalRestok').classList.add('show');

    document.getElementById('tambahStok').oninput = function () {
        const tambah = parseInt(this.value) || 0;
        document.getElementById('previewStok').textContent = s.stock + tambah;
    };
}

function closeModal(e) {
    if (e.target === document.getElementById('modalRestok')) tutupModal();
}

function tutupModal() {
    document.getElementById('modalRestok').classList.remove('show');
}

async function simpanRestok() {
    const tambah = parseInt(document.getElementById('tambahStok').value);
    if (!tambah || tambah < 1) { alert('Masukkan jumlah restok yang valid!'); return; }
    
    const prod = stokData[restokIdx];
    const updatedStock = prod.stock + tambah;
    
    try {
        const response = await fetch('/api/products/seller/' + prod.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...prod, stock: updatedStock })
        });
        
        if (response.ok) {
            tutupModal();
            fetchProducts();
        } else {
            alert('Gagal mengupdate stok');
        }
    } catch(e) {
        console.error(e);
    }
}

fetchProducts();
