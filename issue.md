# Plan: Penyempurnaan Manajemen Status Pesanan

## Deskripsi
Terdapat beberapa kekurangan pada alur pesanan yang perlu diperbaiki agar pengalaman penjual dan pembeli lebih lengkap dan konsisten.

---

## Fitur yang Perlu Diperbaiki/Ditambahkan

### 1. Aksi Penjual di Halaman Pesanan Masuk (`pesananPenjual.html`)

Saat ini hanya ada tombol **Proses**. Perlu ditambahkan:

- **Tombol Terima:** Muncul ketika status pesanan masih `BARU`. Mengubah status menjadi `DIPROSES`.
- **Tombol Batalkan (Cancel):** Muncul ketika status masih `BARU` atau `DIPROSES`. Mengubah status menjadi `DIBATALKAN`.
- **Tombol Selesai:** Muncul ketika status sudah `DIPROSES`. Mengubah status menjadi `SELESAI`.

Aksi tombol ini memanggil endpoint API yang sudah ada atau endpoint baru yang perlu dibuat di `OrderController`.

### 2. Backend: Endpoint Status Update

Pastikan terdapat endpoint untuk setiap transisi status pesanan:
- `PATCH /api/orders/{id}/process` → `BARU` ke `DIPROSES`
- `PATCH /api/orders/{id}/complete` → `DIPROSES` ke `SELESAI`
- `PATCH /api/orders/{id}/cancel` → `BARU` atau `DIPROSES` ke `DIBATALKAN`

Validasi bahwa hanya penjual dari pesanan yang bersangkutan yang dapat mengubah statusnya.

### 3. Sisi Pembeli: Tombol Beli Dinonaktifkan Setelah Pembelian

Di dashboard dan halaman produk, setelah pembeli berhasil membeli:
- Semua tombol **Beli** dinonaktifkan / diubah teksnya menjadi "Sudah Dipesan".
- Ini bisa dilakukan dengan cara menyimpan ID produk yang sudah dipesan ke `sessionStorage`, lalu memeriksa saat kartu produk dirender.

### 4. Bug: Catatan Pembeli Tidak Masuk ke Pesanan

Periksa alur pengiriman data dari form/chat pembeli ke API `POST /api/orders`. Field `notes` harus ikut dikirimkan di dalam payload request body. Pastikan:
- Di frontend (`dashboard.js` atau `produk.js`), field `notes` dari input pengguna benar-benar dimasukkan ke dalam objek JSON yang di-POST.
- Di backend (`OrderController`), field `notes` dari DTO dibaca dan diteruskan ke entitas `Order` saat disimpan.

---

## Langkah Implementasi

1. Perbaiki bug pengiriman field `notes` dari frontend ke backend terlebih dahulu karena paling sederhana.
2. Tambahkan endpoint baru di `OrderController` untuk aksi `complete` dan `cancel`.
3. Update tampilan pesanan penjual (`pesananPenjual.js`) agar menampilkan tombol yang sesuai berdasarkan status pesanan saat ini.
4. Tambahkan logika di frontend pembeli untuk mengunci tombol beli setelah pembelian berhasil.
