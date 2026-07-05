# Plan: Integrasi Menu Pemesanan dan Detail Pesanan Pembeli

Rencana pengerjaan untuk menghubungkan menu pemesanan di navbar, meningkatkan rincian pembelian, serta menambahkan kemampuan pengiriman catatan/pesan ke penjual bagi pembeli.

---

## 1. Hubungkan Menu Pemesanan di Navbar
- Arahkan link **Pemesanan** di navbar (pada `dashboard.html` dan halaman kategori lainnya) dari `href="#"` ke halaman `pesanan.html`.
- Pastikan navbar di semua halaman pembeli konsisten mengarahkan ke halaman pelacakan pesanan ini.

## 2. Peningkatan Tampilan Detail Pembelian (`pesanan.html` & `pesanan.js`)
- Tampilkan detail lengkap produk yang dibeli secara dinamis dari API `/api/orders/buyer` (mengambil pesanan terbaru atau daftar riwayat pesanan).
- Informasi detail yang harus ditampilkan:
  - Foto produk
  - Nama produk
  - Jumlah pembelian (quantity)
  - Harga satuan & Total harga
  - Nama penjual/toko
  - Status pesanan terbaru (`BARU`, `DIPROSES`, `SELESAI`, `DIBATALKAN`)

## 3. Fitur Tambah Pesan/Catatan ke Penjual
- Di dalam halaman detail pesanan (`pesanan.html`), sediakan input teks khusus (atau gunakan integrasi chatbox yang ada) agar pembeli dapat mengetik pesan/catatan tambahan untuk penjual.
- Hubungkan input tersebut agar mengirim data secara asinkron (`fetch` PATCH/POST) ke backend untuk disimpan ke dalam pesanan terkait.
- Pastikan setelah pesan dikirim, data catatan pesanan penjual langsung terupdate secara real-time atau ter-refresh.
