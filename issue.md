# Fitur: Produk Baru Muncul di Dashboard Secara Real-time

## Latar Belakang
Saat ini, ketika penjual menambahkan atau memperbarui produk melalui halaman **Kelola Produk**, perubahan tersebut tidak langsung terlihat di halaman **Dashboard (pembeli)**. Pembeli harus me-*refresh* halaman secara manual untuk melihat produk terbaru.

## Tujuan
Ketika penjual menyimpan produk baru (atau memperbarui produk yang sudah ada), halaman dashboard pembeli harus secara otomatis menampilkan produk terbaru **tanpa perlu refresh halaman**.

---

## Rencana Penyelesaian (High-Level)

### 1. Pilihan Pendekatan: Server-Sent Events (SSE)
Gunakan **Server-Sent Events (SSE)** sebagai cara *backend* mengirim notifikasi ke semua klien yang terhubung secara real-time. SSE lebih cocok dari WebSocket untuk kasus ini karena komunikasinya hanya satu arah (server → client).

> **Catatan**: Proyek sudah menggunakan WebSocket (Stomp) untuk fitur chat. SSE adalah opsi yang lebih ringan khusus untuk notifikasi satu arah. Namun jika ingin menyederhanakan, bisa juga menggunakan WebSocket yang sudah ada dengan menambah *topic* baru.

### 2. Modifikasi Backend
- Buat sebuah **endpoint SSE** (misal: `GET /api/products/stream`) yang mempertahankan koneksi terbuka ke semua klien yang sedang membuka dashboard.
- Setelah operasi *simpan produk* berhasil di `ProductController` (baik POST maupun PUT), kirimkan *event* ke semua klien yang terhubung melalui SSE.
- *Event* yang dikirim cukup berupa sinyal sederhana (misal: `{ "event": "product-updated" }`) atau data produk terbaru secara lengkap.

### 3. Modifikasi Frontend (dashboard.js)
- Saat halaman `dashboard.html` dibuka, buat koneksi SSE ke endpoint `/api/products/stream`.
- Ketika *event* dari server diterima, panggil ulang fungsi `fetchPublicProducts()` yang sudah ada untuk memuat ulang daftar produk tanpa me-*refresh* seluruh halaman.

### 4. Alternatif: Polling Ringan (Jika SSE Terlalu Kompleks)
Jika implementasi SSE dianggap terlalu banyak mengubah *backend*, opsi cadangan adalah **polling**: setiap beberapa detik (misal: setiap 10-15 detik), `dashboard.js` secara otomatis memanggil `fetchPublicProducts()` di latar belakang.

---

## Catatan Penting
- Prioritaskan pendekatan SSE karena lebih efisien dan profesional.
- Pastikan koneksi SSE ditutup secara *graceful* ketika pengguna meninggalkan halaman (`window.onbeforeunload`).
- Jika menggunakan WebSocket yang sudah ada (Stomp/SockJS), cukup tambahkan topic baru, misal `/topic/products`, dan *broadcast* dari backend ketika ada produk yang disimpan.
